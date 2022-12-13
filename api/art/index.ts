import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'node:path';
import artworks from '../../data/art';

const baseUrl = process.env.HOSTNAME ?? process.env.VERCEL_URL!;

export default (request: VercelRequest, response: VercelResponse) => {
  const artworksWithUpdatedImageSource = artworks.map(artwork => {
    return {
      ...artwork,
      imageSource: `https://${path.join(baseUrl, artwork.imageSource)}`,
    };
  });

  response.status(200).json(artworksWithUpdatedImageSource);
};
