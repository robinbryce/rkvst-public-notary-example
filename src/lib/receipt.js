import { receiptTokenProofs } from '$lib/web3/rkvsteventtokens.js';

import { jsonFetchIPFS, ipfsGatewayURL } from '$lib/web3/ipfsfetch.js';

/** this works because we know the payload is json and we know it is encoded
 * with stable sort and exactly what to expect in the first part of the
 * content */
const receiptCBORJSONMagicMarker = '{"application_parameters"';

export class ReceiptMetadata {

	static async fromTokenURI(tokenId, tokenURI, options) {
		const rm = new ReceiptMetadata(tokenId, tokenURI);
		return await rm.fetch(options)

	}
	constructor (tokenURI, tokenId) {
		this.tokenId = tokenId;
		this.fromTokenURI = tokenURI;
		this.identity = undefined;
		this.receipt = undefined;
		this.image = undefined;
		this.metadata = undefined;
	}

	async fetch(options) {

		this.metadata = await jsonFetchIPFS(this.tokenURI, options);
		const base64receipt = await textFetchIPFS(metadata.receipt_url);

		this.image = ipfsGatewayURL(metadata.image);

		const parts = this.tokenURI.split('/');
		// regardless of http vs ipfs, the directory cid is the last path element before metadata.json

		const directory_cid = parts[parts.length - 2];

		this.receipt = ReceiptDetails.fromReceipt(base64receipt);
		this.receipt.updateIPFS({
			directory_cid,
			receipt_url:metadata.receipt_url,
			receipt_content_url: metadata.receipt_content_url
		})
	}
}

export class ReceiptDetails {

	static fromReceipt(base64receipt) {

		const receipt = new ReceiptDetails();
		receipt.setReceipt(base64receipt)
		return receipt;
	}

	static copy(other) {
		const rd = new ReceiptDetails();
		rd.base64 = other.base64;
		rd.binary = other.binary;
		rd.receiptUrl = other.receiptUrl;
		rd.payloadText = other.payloadText;
		rd.payloadJSONUrl = other.payloadJSONUrl;
		rd.payload = structuredClone(other.payload);
		rd.receiptTokenProofs = structuredClone(other.receiptTokenProofs);
		rd.ipfs = structuredClone(other.ipfs);
		rd.metadata = structuredClone(other.metadata);
		return rd
	}

	/**
	 * reset and initialise from a base64 receipt
	 */
	setReceipt(base64Receipt) {
		this.base64 = base64Receipt;
		this.binary = atob(base64Receipt); // ref: draft-birkholz-scitt-receipts
		this.receiptUrl = encodeURI(`data:text/plain;charset=ascii,${base64Receipt}`);
		if (this.binary) {
			this.payloadText = decodePayloadFromCBOR(this.binary);
			this.payloadJSONUrl = encodeURI(`data:application/json;charset=utf-8,${this.payloadText}`);
		}
		if (!this.payloadText) return;
		this.payload = JSON.parse(this.payloadText);
		console.log(Object.keys(this.payload));
		console.log(Object.keys(this.payload.named_proofs[0]));
		this.receiptTokenProofs = receiptTokenProofs(this.payload);

		this.ipfs = {
			directory_cid: undefined,
			receipt_url: undefined,
			receipt_content_url: undefined
		}
		// ERC 1155 metadata
		this.metadata = undefined;
	}

	updateIPFS(ipfs) {
		this.ipfs.directory_cid = ipfs.directory_cid;
		this.ipfs.receipt_url = ipfs.receipt_url;
		this.ipfs.receipt_content_url = ipfs.receipt_content_url;
	}
	isSaved() {
		return (!!this.ipfs?.directory_cid && !!this.ipfs.receipt_url && !!this.ipfs.receipt_content_url)
	}

	updateMetadata(metadata) {
		this.metadata = structuredClone(metadata);
	}
	isMinted() {
		return !!this.metadata;
	}
}

/**
 * Directly represent the base64 receipt as bytes. no translation of any kind.
 * @param {string} receipt base64 encoded receipt
 */
export function stringToByteArray(stringValue) {
	const enc = new TextEncoder();
	return enc.encode(stringValue);
}

export function decodePayload(receipt, pretty = true) {
	const binary = atob(receipt); // ref: draft-birkholz-scitt-receipts
	let content = decodePayloadFromCBOR(binary);
	if (pretty) content = JSON.stringify(JSON.parse(content), null, '  ');
	return content;
}

export function decodePayloadFromCBOR(bytes) {
	let i = bytes.indexOf(receiptCBORJSONMagicMarker);
	if (i < 0) {
		console.log(`ERROR: magic marker not found in "${bytes}"`);
		return '';
	}
	return bytes.slice(i);
}
