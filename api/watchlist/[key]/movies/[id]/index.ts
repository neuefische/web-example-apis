import {
  findMovie,
  readJsonObject,
  route,
  validateMovie,
} from '../../../../../utils/watchlist';

export default route(
  ['GET', 'PUT', 'PATCH', 'DELETE'],
  ({ request, state }) => {
    const movie = findMovie(state, request.query.id);

    switch (request.method) {
      case 'GET':
        return { status: 200, body: movie };

      case 'PUT': {
        const fields = validateMovie(readJsonObject(request), 'replace');
        Object.assign(movie, fields);
        return { status: 200, body: movie, save: true };
      }

      case 'PATCH': {
        const fields = validateMovie(readJsonObject(request), 'partial');
        Object.assign(movie, fields);
        return { status: 200, body: movie, save: true };
      }

      default: {
        // DELETE
        state.movies = state.movies.filter(candidate => candidate.id !== movie.id);
        state.notes = state.notes.filter(note => note.movieId !== movie.id);
        return { status: 204, save: true };
      }
    }
  },
);
