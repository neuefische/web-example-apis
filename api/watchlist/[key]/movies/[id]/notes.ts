import {
  findMovie,
  HttpError,
  LIMITS,
  locationFor,
  readJsonObject,
  route,
} from '../../../../../utils/watchlist';

export default route(['GET', 'POST'], ({ request, key, state }) => {
  const movie = findMovie(state, request.query.id);
  const notes = state.notes.filter(note => note.movieId === movie.id);

  if (request.method === 'GET') {
    return { status: 200, body: notes };
  }

  const { text } = readJsonObject(request);
  if (
    typeof text !== 'string' ||
    text.trim() === '' ||
    text.length > LIMITS.note
  ) {
    throw new HttpError(400, 'Invalid note', [
      `text must be a non-empty string with at most ${LIMITS.note} characters`,
    ]);
  }
  if (notes.length >= LIMITS.notesPerMovie) {
    throw new HttpError(
      409,
      `A movie can have at most ${LIMITS.notesPerMovie} notes`,
    );
  }

  state.noteSeq += 1;
  const note = { id: state.noteSeq, movieId: movie.id, text: text.trim() };
  state.notes.push(note);

  return {
    status: 201,
    headers: {
      Location: locationFor(
        request,
        `/api/watchlist/${key}/movies/${movie.id}/notes`,
      ),
    },
    body: note,
    save: true,
  };
});
