import type { VercelRequest, VercelResponse } from '@vercel/node';
import jokes from '../../data/bad-jokes';

export default (request: VercelRequest, response: VercelResponse) => {
  const id = Number.parseInt(request.query.id as string, 10);
  const jokeIndex = jokes.findIndex(joke => joke.id === id);
  const joke = jokes[jokeIndex];

  if (!joke) {
    return response.status(404).json({ status: 'Not Found' });
  }

  const nextId = jokes[jokeIndex + 1]?.id ?? jokes[0].id;
  const prevId = jokes[jokeIndex - 1]?.id ?? jokes[jokes.length - 1].id;

  response.status(200).json({ ...joke, nextId, prevId });
};
