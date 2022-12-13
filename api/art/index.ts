import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import artworks from '../../data/art';

export default (request: VercelRequest, response: VercelResponse) => {
  console.log(process.env.VERCEL_URL);
  const artworksWithUpdatedImageSource = artworks.map(artwork => {
    console.log(artwork.imageSource);
    return {
      ...artwork,
      imageSource: `https://${path.join(
        process.env.VERCEL_URL || '',
        artwork.imageSource
      )}`,
    };
  });

  response.status(200).json(artworksWithUpdatedImageSource);
};
