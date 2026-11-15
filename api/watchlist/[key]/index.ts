import { deleteState, route } from '../../../utils/watchlist';

// DELETE resets the namespace: the next request starts again with the seed data.
export default route(
  ['DELETE'],
  async ({ key }) => {
    await deleteState(key);
    return { status: 204 };
  },
  { loadState: false },
);
