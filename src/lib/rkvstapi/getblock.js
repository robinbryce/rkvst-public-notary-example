import * as env from '$env/static/public';

import {hexlify} from '$lib/ethutils.js';

const archivistNodeBlockPath = 'archivist/v1/archivistnode/block';

/**
 * 
 * @param {string} blockNumber block number
 */
export async function getBlock(blockNumber) {

  blockNumber = hexlify(blockNumber);
  let options = {
    method: 'GET',
    headers: new Headers([
      ['content-type', 'application/json']
    ]),
  }

  let url = (
    '/api/' + env['PUBLIC_RKVST_IO_SEGMENT'] + '/' + archivistNodeBlockPath
  );
  url = url + `?number=${blockNumber}`
  console.log(`getBlock: ${url}`);

  let resp;
  let data;
  try {
    resp = await fetch(url, options);
    console.log(resp);
    data = await resp.json();
  } catch (err) {
    console.log(`ERROR: fetching block ${blockNumber} ${resp?.statusText} ${err}`);
    throw(err);
  }
  return data;
}