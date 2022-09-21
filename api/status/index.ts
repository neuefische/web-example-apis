import type { VercelRequest, VercelResponse } from '@vercel/node';

class BadGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadGatewayError';
  }
}

class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}

class ImATeapotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImATeapotError';
  }
}

// getRandomInt returns a random integer between min (inclusive) and max (exclusive)
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// wait for ms milliseconds
function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function throwRandomly<E extends Error>(percentage: number, error: E) {
  const random = Math.random();
  if (random <= percentage) {
    throw error;
  }
}

export default async (request: VercelRequest, response: VercelResponse) => {
  try {
    await wait(getRandomInt(100, 1000));
    throwRandomly(0.1, new InternalServerError('Internal Server Error 🫠'));

    await wait(getRandomInt(200, 2000));
    throwRandomly(0.25, new BadGatewayError('Bad Gateway 🚪'));

    await wait(getRandomInt(500, 1000));
    throwRandomly(0.25, new ImATeapotError('I am a Teapot 🫖'));

    await wait(getRandomInt(100, 1000));
    response.status(200).json({ status: 'Ok' });
  } catch (error) {
    if (error instanceof BadGatewayError) {
      response.status(502).json({ status: error.message });
    } else if (error instanceof InternalServerError) {
      response.status(500).json({ status: error.message });
    } else if (error instanceof ImATeapotError) {
      response.status(418).json({ status: error.message });
    } else {
      response.status(500).json({ status: 'Internal Server Error' });
    }
  }
};
