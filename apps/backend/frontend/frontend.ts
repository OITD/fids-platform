import { api } from 'encore.dev/api';

/**
 * Making use of app.static to serve static assets from the file system.
 * https://encore.dev/docs/ts/primitives/static-assets
 */
export const assets = api.raw({ expose: true, method: 'HEAD' }, async (req, res) => {
  // Implement the raw endpoint to match the client's expectations
  res.writeHead(201);
  res.end();
});
