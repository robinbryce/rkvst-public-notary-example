import * as env from '$env/static/public';
import { env as secrets } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

/** @type {import('./arena/$types').RequestHandler} */
export async function GET() {
  // Get the token

  const fields = {
    "grant_type": "client_credentials",
    "client_id": `${secrets["RKVST_APP_REGISTRATION_CLIENT_ID"]}`,
    "client_secret": `${secrets["RKVST_APP_REGISTRATION_CLIENT_SECRET"]}`
  }
  const form = []
  for (const [field, value] of Object.entries(fields)) {
    form.push(encodeURIComponent(field) + "=" + encodeURIComponent(value));
  }

  const url = `${env["PUBLIC_RKVST_URL"]}archivist/iam/v1/appidp/token`
  console.log(url);
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: form.join("&")
  });
  console.log(JSON.stringify(resp.status));
  console.log(JSON.stringify(resp.statusText));
  const data = await resp.json();
  console.log(JSON.stringify(data));
  const accessToken = data.access_token;
  const decodedToken = parseJwt(accessToken);

  const publicAssets = [];
  // Note: could put a list assets filter query in the token if we wanted to be more general.
  for (let i = 0; i < Number(decodedToken.num_public_assets ?? 0); i++ ) {
    publicAssets.push(decodedToken[`public_asset_${i}`]);
  }
  console.log(JSON.stringify(publicAssets))

  return json({
    token: accessToken,
    public_assets: publicAssets
  });
}

function parseJwt (token) {
  const parts = token.split('.');
  console.log(JSON.stringify(parts));
  return JSON.parse(Buffer.from(parts[1], 'base64').toString());
}