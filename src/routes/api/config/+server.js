import { json } from '@sveltejs/kit';

import { getToken } from '../rkvst/io/authorize.js';

/** @type {import('./arena/$types').RequestHandler}
 * 
 * This endpoint returns the configuration for the demo. The configuration is
 * obtained from the hosting environment. .env files for development, and
 * environment secrets for vercel.
 * 
 * See getToken for details about how the "app registration" token is obtained.
 * 
 * For this demo, the  RKVST tenant user who provides the "app registration",
 * configures JWT claims identifying RKVST "assets" which are configured
 * specially to show off the potential of off line verifiable "proof of posting"
 * receipts.
 */
export async function GET() {
  // Get the token
  const accessToken = await getToken();
  const decodedToken = parseJwt(accessToken);

  const publicAssets = [];
  // Special handling for the claims specific to this demo
  if (decodedToken.num_public_assets) {
    // Note: could put a list assets filter query in the token if we wanted to be more general.
    for (let i = 0; i < Number(decodedToken.num_public_assets ?? 0); i++ ) {
      publicAssets.push(decodedToken[`public_asset_${i}`]);
    }

  } else {
    console.log(`WARNING: no public assets identified in token claims. Got ${Object.keys(decodedToken)}`);
  }

  console.log(JSON.stringify(publicAssets))

  return json({
    // Exposing the claims exposes information which may or may not be sensitve.
    // It does not expose the api access credential.
    claims: decodedToken,
    public_assets: publicAssets
  });
}

function parseJwt (token) {
  const parts = token.split('.');
  return JSON.parse(Buffer.from(parts[1], 'base64').toString());
}