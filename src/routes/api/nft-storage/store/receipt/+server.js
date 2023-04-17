import { env as secrets } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

import { NFTStorage } from 'nft.storage';

import { decodePayload } from '$lib/receipt.js';

/**
 * request body requirements:
 *   receipt_base64     [required] original receipt as it came from the rkvst.
 * @param {*} event
 * @returns
 */
export async function POST(event) {
	const client = new NFTStorage({ token: secrets['NFTSTORAGE_API_KEY'] });

	const { receipt_base64 } = await event.request.json();
	if (!receipt_base64) throw error(400, 'receipt_base64 is a required body element');

	// we inline the content into the nft metadata, but refer to the original as an external file
	const receipt_content = decodePayload(receipt_base64);

	const receiptFile = new File([receipt_base64], 'receipt.b64.txt', { type: 'text/plain' });
	const receiptContentFile = new File([receipt_content], 'receipt-content.json', {
		type: 'application/json'
	});

	let cid;
	try {
		cid = await client.storeDirectory([receiptFile, receiptContentFile]);
	} catch (err) {
		console.log(`ERROR: receipt POST ${err}`);
		throw error(503, `${err}`);
	}
	const body = JSON.stringify({
		directory_cid: cid,
		receipt_url: `ipfs://${cid}/receipt.b64.txt`,
		receipt_content_url: `ipfs://${cid}/receipt-content.json`
	});
	const response = new Response(body, {
		status: 200,
		statusText: 'OK',
		headers: [['content-type', 'application/json']]
	});
	return response;
}
