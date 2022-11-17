import type { VercelRequest, VercelResponse } from '@vercel/node';
import jokes from '../../data/bad-jokes';

export default (request: VercelRequest, response: VercelResponse) => {
  const id = Number.parseInt(request.query.id as string, 10);
  const joke = jokes.find(joke => joke.id === id);

  if (!joke) {
    return response.status(404).json({ status: 'Not Found' });
  }

  response.status(200).json(joke);
};
