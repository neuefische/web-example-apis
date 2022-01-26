import type { VercelRequest, VercelResponse } from '@vercel/node';
import categories from '../../data/shopping/categories';

export default (request: VercelRequest, response: VercelResponse) => {
  response.status(200).json({
    data: categories,
  });
};
