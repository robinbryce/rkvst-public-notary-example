import { ethers } from 'ethers';

import * as env from '$env/static/public';
import { env as secrets } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

import { NFTStorage } from 'nft.storage';

const log = console;
const defaultImageSize = '256x256';

/**
 * request body requirements:
 *   receipt_base64     [required] original receipt as it came from the rkvst.
 * @param {*} event
 * @returns
 */
export async function POST(event) {
	const client = new NFTStorage({ token: secrets['NFTSTORAGE_API_KEY'] });

	const { metadata } = await event.request.json();
	if (!metadata) throw error(400, 'metadata a required body element');

	const prompt = metadata.image_prompt ?? env['PUBLIC_DEFAULT_IMAGE_PROMPT'];
	delete metadata['image'];
	const imageBinary = await generateImage(event.fetch, prompt);
	metadata.image = new File([imageBinary], 'receipt-avatar.png', { type: 'image/png' });

	const { token, car } = await NFTStorage.encodeNFT(metadata);
	const cid = await client.storeCar(car);

	const body = JSON.stringify({
		cid: cid,
		metadata: token
	});
	const response = new Response(body, {
		status: 200,
		statusText: 'OK',
		headers: [['content-type', 'application/json']]
	});
	return response;
}

async function generateImage(fetch, prompt) {
	if (!fetch) throw new Error('you must provide a fetch implementation');

	prompt = prompt ?? env['PUBLIC_DEFAULT_IMAGE_PROMPT'];

	const body = {
		prompt,
		n: 1,
		size: defaultImageSize,
		response_format: 'b64_json'
	};

	const path = env['PUBLIC_OPENAI_IMAGES_URL'];
	log.info(`${path} ${prompt}`);
	log.debug('prompt body', body);

	const result = await fetch(path, {
		method: 'post',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${secrets['OPENAI_APIKEY']}`
		}
	});
	const j = await result.json();
	const b64json = j['data'][0]?.b64_json;
	if (!b64json) {
		throw new Error('No data item in response');
	}
	return ethers.utils.base64.decode(b64json);
}
