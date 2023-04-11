import * as env from '$env/static/public';
import { env as secrets } from '$env/dynamic/private';

/**
 * Get the access token for the configured api registration. This should NEVER
 * be returned to the browser for this style of demo as the client is not
 * authorized to anything, certainly not the RKVST.
 * 
 * RKVST customers use "app registrations" to enable programmatic access to their content.
 * https://docs.rkvst.com/docs/api-reference/app-registrations-api/
 * 
 * These enable openid connect client-id & secrets to be used to obtain access
 * tokens suitable for "Authorization Bearer ${TOKEN}" headers.
 *
 */
export async function getToken() {
  const fields = {
    "grant_type": "client_credentials",
    "client_id": `${secrets["RKVST_APP_REGISTRATION_CLIENT_ID"]}`,
    "client_secret": `${secrets["RKVST_APP_REGISTRATION_CLIENT_SECRET"]}`
  }
  const form = []
  for (const [field, value] of Object.entries(fields)) {
    form.push(encodeURIComponent(field) + "=" + encodeURIComponent(value));
  }

  // Note: We could go via our own api/rkvst/io proxy route, but there is no
  // need and this avoids request loop pitfalls with authorize=true
  const url = `${env["PUBLIC_RKVST_URL"]}archivist/iam/v1/appidp/token`
  console.log(url);
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: form.join("&")
  });
  const data = await resp.json();
  return data?.access_token;
}