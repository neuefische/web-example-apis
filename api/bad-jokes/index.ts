import type { VercelRequest, VercelResponse } from '@vercel/node';
import jokes from '../../data/bad-jokes';

export default (request: VercelRequest, response: VercelResponse) => {
  response.status(200).json(jokes);
};
