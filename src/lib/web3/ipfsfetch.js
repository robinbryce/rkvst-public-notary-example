const ipfsProtocol = 'ipfs:';
const defaultIPFSGateway = 'https://ipfs.io/ipfs/'

export function ipfsGatewayURL(origURI, options) {

	const parsed = new URL(origURI);
	if (parsed.protocol !== ipfsProtocol) {
    console.debug(`ipfsGatewayURL# ipfs protocol scheme not matched, returning origURI ${origURI}`);
		return origURI;
  }

	// check the port afterwards, incase the uri was previously re-written to a
	// http gateway on a specific port.
	if (!!parsed.port) throw new Error(`port numbers in ipfs urls are not supported`);

	const ipfsGateway = options?.ipfsGateway ?? defaultIPFSGateway;
	const cid = parsed.hostname;
	const url = `${ipfsGateway}${cid}${parsed.pathname}`;
	return url;
}


export async function fetchIPFS(origURI, options) {

	let url = ipfsGatewayURL(origURI);

	let resp;
	let data;

  const fetchOptions = {
    method: 'GET'
  }
  if (options?.contentType) {
    fetchOptions.headers = new Headers([['Content-Type', options.contentType]]);
  }

	try {
		resp = await fetch(url, fetchOptions);
		if (options?.contentType === 'application/json') {
			data = await resp.json();
		} else if (options?.contentType === 'text/plain') {
			data = await resp.text()
		} else {
      return resp;
		}
	} catch (err) {
		console.log(`ERROR: fetchIPFS# fetching url ${url} ${err}`);
		throw err;
	}
	return data;
}


/**
 * fetch json data from a raw ipfs url. If the url does not have the ipfs:// scheme, use it 'as-is'
 * @param {string} origURI 
 * @param {object} options 
 * @returns 
 */
export async function jsonFetchIPFS(origURI, options) {
	// options = {...options, contentType: 'application/json'}
	const resp = await fetchIPFS(origURI, options);
  return await resp.json();
}

export async function textFetchIPFS(origURI, options) {
	// options = {...options, contentType: 'text/plain'}
	const resp = await fetchIPFS(origURI, options)
  return await resp.text();
}