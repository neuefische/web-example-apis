import type { VercelRequest, VercelResponse } from '@vercel/node';
import jokes from '../../data/bad-jokes';

// pick a random value from an array
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export default (request: VercelRequest, response: VercelResponse) => {
  response.status(200).json(pickRandom(jokes));
};
