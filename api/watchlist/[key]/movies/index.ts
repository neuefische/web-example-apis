import {
  HttpError,
  LIMITS,
  locationFor,
  readJsonObject,
  route,
  validateMovie,
} from '../../../../utils/watchlist';

export default route(['GET', 'POST'], ({ request, key, state }) => {
  if (request.method === 'GET') {
    const { watched } = request.query;
    if (watched === undefined) {
      return { status: 200, body: state.movies };
    }
    if (watched !== 'true' && watched !== 'false') {
      throw new HttpError(400, 'The query parameter watched must be true or false');
    }
    return {
      status: 200,
      body: state.movies.filter(movie => movie.watched === (watched === 'true')),
    };
  }

  const fields = validateMovie(readJsonObject(request), 'create');
  if (state.movies.length >= LIMITS.movies) {
    throw new HttpError(
      409,
      `The watchlist is full (${LIMITS.movies} movies). Delete a movie first or reset the key.`,
    );
  }

  state.movieSeq += 1;
  const movie = {
    id: state.movieSeq,
    title: fields.title as string,
    year: fields.year as number,
    watched: fields.watched ?? false,
  };
  state.movies.push(movie);

  return {
    status: 201,
    headers: {
      Location: locationFor(request, `/api/watchlist/${key}/movies/${movie.id}`),
    },
    body: movie,
    save: true,
  };
});
