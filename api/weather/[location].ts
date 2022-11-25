import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getWeather, LocationName, LOCATIONS } from '../../utils/weather';

export default (request: VercelRequest, response: VercelResponse) => {
  const location = request.query.location as LocationName;
  if (!LOCATIONS[location]) {
    return response
      .status(404)
      .json({ status: 'Unknown location: ' + location });
  }
  response.status(200).json(getWeather(location, new Date()));
};
