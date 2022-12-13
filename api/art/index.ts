import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'node:path';
import artworks from '../../data/art';

const hostname = process.env.HOSTNAME ?? process.env.VERCEL_URL!;

export default (request: VercelRequest, response: VercelResponse) => {
  const artworksWithUpdatedImageSource = artworks.map(artwork => {
    return {
      ...artwork,
      imageSource: `https://${path.join(hostname, artwork.imageSource)}`,
    };
  });

  response.status(200).json(artworksWithUpdatedImageSource);
};
