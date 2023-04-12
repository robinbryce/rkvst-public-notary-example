import * as env from '$env/static/public';

import { uuidFromIdentity } from './identity.js';

/**
 * 
 * @param {*} assetIdentity 
 * @param {*} public  if true the public asset url is fetched regardless of whether the identity has a restricted path form
 * @param {*} pageSize 
 * @param {*} params 
 * @returns 
 */
export async function listEvents(assetIdentity, isPublic, pageSize, params={}) {
  params['page_size'] = pageSize;

  const resp = await fetch(
    buildInitialUrl(assetIdentity, {params, isPublic}),
    {headers:new Headers([
      ['accept', '*/*'],
      ['accept-language', 'en-GB,en;q=0.5'],
      ['content-type', 'application/json']
    ])});
  const data = await resp.json();
  // console.log(`DATA: ${JSON.stringify(data)}`)
  return data;
}

export function buildInitialUrl(assetIdentity, queryOptions) {
  let path;
  if (!queryOptions.isPublic && !assetIdentity.startsWith('publicassets')){
    path = (
      '/api/' + env['PUBLIC_RKVST_IO_SEGMENT'] + '/' + `archivist/v2/${assetIdentity}/events`
    );
  } else {
    const assetUUID = uuidFromIdentity(assetIdentity);
    path = (
      '/api/' + env['PUBLIC_RKVST_IO_SEGMENT'] + '/' + `archivist/publicassets/${assetUUID}/events`
    );
  }

  const params = Object.entries(queryOptions?.params ?? [])
    .map((pair) => `${pair[0]}=${pair[1]}`)
    .join('&');

  const url = path + (params ? `?${params}` : '');
  console.log(`buildInitialUrl: ${url}`);
  return url;
}

export function buildNextPagedUrl(assetUUID, pageToken, pageSize=undefined) {
  if  (!pageToken) throw new Error('a page token is required here');

  const path = (
    '/' + env['PUBLIC_RKVST_IO_SEGMENT'] + '/' + `archivist/v2/assets/${assetUUID}/events`
  );

  let url = `?page_token=${pageToken}`;
  if (typeof pageSize !== 'undefined')
    url = url + `&page_size=${pageSize}`;

  return url;
}