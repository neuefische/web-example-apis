import type { VercelRequest, VercelResponse } from '@vercel/node';
import items from '../../data/shopping/items';

export default (request: VercelRequest, response: VercelResponse) => {
  response.status(200).json({
    data: items,
  });
};
