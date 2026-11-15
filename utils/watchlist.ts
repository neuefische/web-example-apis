import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createSeedState,
  type Movie,
  type WatchlistState,
} from '../data/watchlist/seed';

const TTL_SECONDS = 60 * 60 * 24;
const KEY_PATTERN = /^[a-z0-9-]{3,32}$/;

export const LIMITS = {
  movies: 50,
  notesPerMovie: 20,
  bodyBytes: 1024,
  title: 100,
  note: 280,
};

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: string[],
  ) {
    super(message);
  }
}

// Storage: Upstash Redis when configured, otherwise an in-memory map (local development only).
// The whole namespace is stored as one JSON value. Concurrent writes within one namespace can
// overwrite each other, which is fine for a training API where one person uses one key.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : undefined;
const memory = new Map<string, { state: WatchlistState; expires: number }>();

// Every route is its own serverless function with its own memory, so the in-memory fallback
// would silently lose data between routes. Fail loudly instead when deployed without Redis.
function assertStorage() {
  if (!redis && process.env.VERCEL) {
    throw new HttpError(
      503,
      'Storage is not configured: connect an Upstash Redis database to this Vercel project',
    );
  }
}

const storageKey = (key: string) => `watchlist:${key}`;

async function loadState(key: string): Promise<WatchlistState | null> {
  if (redis) {
    return redis.get<WatchlistState>(storageKey(key));
  }
  const entry = memory.get(key);
  if (!entry || entry.expires < Date.now()) {
    return null;
  }
  return entry.state;
}

async function saveState(key: string, state: WatchlistState) {
  if (redis) {
    await redis.set(storageKey(key), state, { ex: TTL_SECONDS });
    return;
  }
  memory.set(key, { state, expires: Date.now() + TTL_SECONDS * 1000 });
}

export async function deleteState(key: string) {
  if (redis) {
    await redis.del(storageKey(key));
    return;
  }
  memory.delete(key);
}

export interface Result {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
  // set to true when the handler changed the state
  save?: boolean;
}

interface Context {
  request: VercelRequest;
  key: string;
  state: WatchlistState;
}

type Handler = (context: Context) => Result | Promise<Result>;

function send(response: VercelResponse, result: Result) {
  for (const [name, value] of Object.entries(result.headers ?? {})) {
    response.setHeader(name, value);
  }
  if (result.body === undefined) {
    response.status(result.status).end();
  } else {
    response.status(result.status).json(result.body);
  }
}

function sendError(response: VercelResponse, error: unknown) {
  if (error instanceof HttpError) {
    send(response, {
      status: error.status,
      body: {
        error: error.message,
        ...(error.details && { details: error.details }),
      },
    });
    return;
  }
  console.error(error);
  send(response, { status: 500, body: { error: 'Internal Server Error' } });
}

export function route(
  allowedMethods: string[],
  handler: Handler,
  options: { loadState?: boolean } = {},
) {
  return async (request: VercelRequest, response: VercelResponse) => {
    try {
      if (request.method === 'OPTIONS') {
        return send(response, { status: 204 });
      }

      if (!request.method || !allowedMethods.includes(request.method)) {
        return send(response, {
          status: 405,
          headers: { Allow: allowedMethods.join(', ') },
          body: {
            error: `Method ${request.method} is not allowed for this URL`,
            allowed: allowedMethods,
          },
        });
      }

      const key = String(request.query.key ?? '');
      if (!KEY_PATTERN.test(key)) {
        throw new HttpError(
          400,
          'The key in the URL must be 3 to 32 characters: lowercase letters, digits and "-"',
        );
      }

      assertStorage();

      let state: WatchlistState | null = null;
      let isNew = false;
      if (options.loadState !== false) {
        state = await loadState(key);
        if (!state) {
          state = createSeedState();
          isNew = true;
        }
      }

      const result = await handler({
        request,
        key,
        state: state as WatchlistState,
      });

      if (state && (result.save || isNew)) {
        await saveState(key, state);
      }
      send(response, result);
    } catch (error) {
      sendError(response, error);
    }
  };
}

export function readJsonObject(request: VercelRequest): Record<string, unknown> {
  const contentType = request.headers['content-type'] ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new HttpError(
      415,
      'Content-Type must be application/json',
      contentType ? [`received: ${contentType}`] : ['no Content-Type header'],
    );
  }

  let body: unknown;
  try {
    body = request.body;
  } catch {
    throw new HttpError(400, 'The request body is not valid JSON');
  }

  if (body === undefined || body === null || body === '') {
    throw new HttpError(400, 'The request body is required');
  }
  if (typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'The request body must be a JSON object');
  }
  if (JSON.stringify(body).length > LIMITS.bodyBytes) {
    throw new HttpError(
      413,
      `The request body must not be larger than ${LIMITS.bodyBytes} bytes`,
    );
  }
  return body as Record<string, unknown>;
}

export function parseId(value: unknown) {
  const text = String(value ?? '');
  return /^\d+$/.test(text) ? Number.parseInt(text, 10) : Number.NaN;
}

export function findMovie(state: WatchlistState, id: unknown) {
  const movie = state.movies.find(candidate => candidate.id === parseId(id));
  if (!movie) {
    throw new HttpError(404, `Movie ${String(id)} not found`);
  }
  return movie;
}

export function locationFor(request: VercelRequest, path: string) {
  const host = request.headers.host ?? 'example-apis.vercel.app';
  const forwarded = request.headers['x-forwarded-proto'];
  const protocol =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
    (host.startsWith('localhost') ? 'http' : 'https');
  return `${protocol}://${host}${path}`;
}

type MovieFields = Pick<Movie, 'title' | 'year' | 'watched'>;

// "create" requires title and year, "replace" (PUT) requires all fields, "partial" (PATCH) at least one
export function validateMovie(
  body: Record<string, unknown>,
  mode: 'create' | 'replace' | 'partial',
): Partial<MovieFields> {
  const details: string[] = [];
  const fields: Partial<MovieFields> = {};
  const maxYear = new Date().getFullYear() + 5;

  if ('title' in body) {
    if (
      typeof body.title !== 'string' ||
      body.title.trim() === '' ||
      body.title.length > LIMITS.title
    ) {
      details.push(
        `title must be a non-empty string with at most ${LIMITS.title} characters`,
      );
    } else {
      fields.title = body.title.trim();
    }
  } else if (mode !== 'partial') {
    details.push('title is required');
  }

  if ('year' in body) {
    if (
      !Number.isInteger(body.year) ||
      (body.year as number) < 1888 ||
      (body.year as number) > maxYear
    ) {
      details.push(`year must be an integer between 1888 and ${maxYear}`);
    } else {
      fields.year = body.year as number;
    }
  } else if (mode !== 'partial') {
    details.push('year is required');
  }

  if ('watched' in body) {
    if (typeof body.watched !== 'boolean') {
      details.push('watched must be true or false');
    } else {
      fields.watched = body.watched;
    }
  } else if (mode === 'replace') {
    details.push('watched is required');
  }

  if (
    mode === 'partial' &&
    details.length === 0 &&
    Object.keys(fields).length === 0
  ) {
    details.push('send at least one of: title, year, watched');
  }

  if (details.length > 0) {
    throw new HttpError(400, 'Invalid movie', details);
  }
  return fields;
}
