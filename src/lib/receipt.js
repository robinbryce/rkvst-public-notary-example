import {receiptTokenProofs} from "$lib/web3/rkvsteventtokens.js";

/** this works because we know the payload is json and we know it is encoded
 * with stable sort and exactly what to expect in the first part of the
 * content */
const receiptCBORJSONMagicMarker = '{"application_parameters"';

export class DecodedReceipt {
	constructor(receipt) {
		this.base64 = receipt;
		this.binary = atob(receipt); // ref: draft-birkholz-scitt-receipts
		this.receiptUrl = encodeURI(`data:text/plain;charset=ascii,${receipt}`);
		if (this.binary) {
			this.payloadText = decodePayloadFromCBOR(this.binary);
			this.payloadJSONUrl = encodeURI(`data:application/json;charset=utf-8,${this.payloadText}`);
		}
		if (!this.payloadText)
			return;
		this.payload = JSON.parse(this.payloadText);
		console.log(Object.keys(this.payload));
		console.log(Object.keys(this.payload.named_proofs[0]));
		this.receiptTokenProofs = receiptTokenProofs(this.payload);
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
