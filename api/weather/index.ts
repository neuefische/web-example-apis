import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Simplex1 } from 'tumult';

export default (request: VercelRequest, response: VercelResponse) => {
  // Start of current hour
  const baseDate = new Date();
  baseDate.setMinutes(0, 0, 0);

  // Seconds since start of current our
  const seconds = (Date.now() - baseDate.getTime()) / 1000;

  const secondsPerHour = 60 * 60;

  // Value between 0 and 1 to get the sample
  const samplePoint = seconds / secondsPerHour;

  // Generate sample
  const seed = 'sunny weather';
  const simplex = new Simplex1(seed);
  const sample = simplex.gen(samplePoint);

  // For some reason the sample is mostly between -0.0x and 0.0x
  // Multiply by 10 and ensure it's in bounds
  const sampleInBounds = Math.max(Math.min(sample * 10, 1), -1);

  // Convert value between -1 and 1 to a value between 0 and 1
  const random = (sampleInBounds + 1) / 2;

  const maxTemperature = 35;
  const temperature = Math.floor(maxTemperature * random);

  const goodConditions = ['☁️', '🌤️', '☀️'];
  const badConditions = ['🌨️', '🌧️', '⛈️'];
  const conditions = [...badConditions, ...goodConditions];
  const condition = conditions[Math.floor(random * conditions.length)];

  const isGoodWeather = random >= 0.5;

  response.status(200).json({
    temperature,
    condition,
    isGoodWeather,
  });
};
