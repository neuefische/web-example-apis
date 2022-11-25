import { Simplex1 } from 'tumult';

const CONDITIONS_GOOD = ['☁️', '🌤️', '☀️', '☀️'];

interface Location {
  name: string;
  seed: string;
  conditions: string[];
  minTemp: number;
  maxTemp: number;
}

export type LocationName = 'europe' | 'arctic' | 'rainforest' | 'sahara';

export const LOCATIONS: Record<LocationName, Location> = {
  europe: {
    name: 'Europe',
    seed: 'europe',
    conditions: ['⛈️', '🌧️', '🌧️', '🌧️', '☁️', '☁️', '🌤️', '🌤️', '☀️', '☀️'],
    minTemp: -5,
    maxTemp: 35,
  },
  arctic: {
    name: 'Arctic',
    seed: 'arctic',
    conditions: ['🌧️', '🌧️', '🌧️', '🌧️', '☁️', '🌤️', '☀️'],
    minTemp: -30,
    maxTemp: 5,
  },
  rainforest: {
    name: 'Rainforest',
    seed: 'rainforest',
    conditions: ['🌧️', '🌧️', '🌧️', '⛈️', '🌦️', '🌦️'],
    minTemp: 8,
    maxTemp: 32,
  },
  sahara: {
    name: 'Sahara',
    seed: 'sahara',
    conditions: ['☁️', '🌤️', '🌤️', '☀️', '☀️', '☀️'],
    minTemp: 25,
    maxTemp: 45,
  },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pick<T>(arr: T[], t: number) {
  return (arr?.[Math.floor(t * arr.length)] ?? arr.at(-1))!;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCurrentHourProgess(now: Date) {
  const startOfHour = new Date(now);
  startOfHour.setMinutes(0, 0, 0);
  return (now.getTime() - startOfHour.getTime()) / 3.6e6;
}

function noise(seed: string, pos: number) {
  const scale = 6.5;
  const timeScale = 10;

  // Generate sample
  const simplex = new Simplex1(seed);
  const sample = simplex.gen(pos * timeScale);
  const sampleInBounds = clamp(sample * scale, -1, 1);

  // Convert value between -1 and 1 to a value between 0 and 1
  return (sampleInBounds + 1) / 2;
}

export function getWeather(location: LocationName, now: Date) {
  const { seed, conditions, minTemp, maxTemp, name } = LOCATIONS[location];

  const progress = getCurrentHourProgess(now);

  const rTemperature = noise(seed + 'temperature', progress);
  const rCondition = noise(seed + 'condition', progress + 10);

  const temperature = Math.floor(lerp(minTemp, maxTemp, rTemperature));

  let condition = pick(conditions, rCondition);
  if (temperature < 0 && condition === '🌧️') {
    condition = '🌨️';
  }

  const isGoodWeather = CONDITIONS_GOOD.includes(condition);

  return {
    // progress: Math.floor(progress * 60),
    location: name,
    temperature,
    condition,
    isGoodWeather,
  };
}

export function testWeather(location: LocationName) {
  console.clear();
  // get weather for each minute of the current hour
  const now = new Date();

  let w: any[] = [];

  for (let i = 0; i < 60; i++) {
    const date = new Date(now);
    date.setMinutes(i);
    w.push(getWeather(location, date));
  }

  console.table(w);
}
