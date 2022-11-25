import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getWeather } from '../../utils/weather';

export default (request: VercelRequest, response: VercelResponse) => {
  const location = 'europe';
  response.status(200).json(getWeather(location, new Date()));
};
