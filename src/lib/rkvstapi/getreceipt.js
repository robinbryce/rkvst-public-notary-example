import * as env from '$env/static/public';

import { hexlify } from '$lib/ethutils.js';

const publicIdentityPrefix = 'publicassets/';
const restrictedIdentityPrefix = 'assets/';

const notaryEventClaimsPath = 'archivist/v1/notary/claims/events';
const notaryEventReceiptsPath = 'archivist/v1/notary/receipts';

/**
 * The proof for a public event then shows the earliest point at which the
 * general public could have known about the event data you recorded. When you
 * want to demonstrate the earliest that users of your tenant could have relied
 * on the values for decision making, get the proof using its restricted
 * identity.
 *
 * When obtaining proofs for restricted assets, pass the asset identity and
 * blocknumber only. The proof can still be independently verified provided you
 * are willing to reveal the data held in that event to the verifier.
 *
 * ***NOTICE*** If you fetch your restricted event receipts using this
 * application (configured for your tenant) the proof data (including the values
 * from your event) is visible to the deployment host.
 *
 * @param {string} eventIdentity
 * @param {boolean|undefined} publicProof set false to force a restricted proof for a public event
 */
export async function getReceipt(eventIdentity, blockNumber = undefined, publicProof = undefined) {
	/** we have a bug in our beta api that prevents this from working as it should.
   * currently, you can get a restricted receipt for restricted assets, and a
   * public receipt for public ones. but you cant force a restricted event
   * receipt for a public event.
   * 
  if (typeof publicProof === 'undefined')
    publicProof = eventIdentity.startsWith(publicIdentityPrefix);
  else if (publicProof === true) {
    if (eventIdentity.startsWith(restrictedIdentityPrefix))
      eventIdentity = 'public' + restrictedIdentityPrefix
  } else if (publicProof === false) {
    if (eventIdentity.startsWith(restrictedIdentityPrefix))
      eventIdentity = eventIdentity.slice(0, "public".length));
  } else {
    throw new Error(`unexpected type for publicProof: ${typeof publicProof}`);
  }
  */
	eventIdentity = eventIdentity.slice('public'.length);

	let body = {
		identity: eventIdentity,
		block_number: hexlify(blockNumber)
	};
	console.log(`getReceipt: ${JSON.stringify(body)}`);

	let options = {
		method: 'POST',
		headers: new Headers([['content-type', 'application/json']]),
		body: JSON.stringify(body)
	};

	let url = '/api/' + env['PUBLIC_RKVST_IO_SEGMENT'] + '/' + notaryEventClaimsPath;

	let resp;
	let claim;
	try {
		resp = await fetch(url, options);
		const data = await resp.json();
		claim = data?.claim;
	} catch (err) {
		console.log(`ERROR: fetching claim for ${eventIdentity} ${resp.statusText} ${err}`);
		throw err;
	}

	if (!claim)
		throw new Error(`ERROR: empty claim from ${notaryEventClaimsPath} for ${eventIdentity}`);

	options.body = JSON.stringify({ claim });
	url = '/api/' + env['PUBLIC_RKVST_IO_SEGMENT'] + '/' + notaryEventReceiptsPath;

	let receipt;
	try {
		resp = await fetch(url, options);
		const data = await resp.json();
		// The receipt is CBOR base64 encoded, as specified by https://datatracker.ietf.org/doc/draft-birkholz-scitt-receipts/
		receipt = data?.receipt;
	} catch (err) {
		console.log(
			`ERROR: fetching receipt for ${eventIdentity} with claim "${claim}" ${resp.statusText} ${err}`
		);
		throw err;
	}
	if (!receipt)
		throw new Error(
			`ERROR: empty receipt from ${notaryEventReceiptsPath} for ${eventIdentity} claim "${claim}"`
		);
	return receipt;
}
