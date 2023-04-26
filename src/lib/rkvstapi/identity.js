import {ethers } from 'ethers';

import { bigishToHex } from '$lib/idioms.js';

export function receiptTokenID(event, which = 1) {
  const uuid = uuidFromIdentity(event.identity).replace(/-/g, '');
  let id = ethers.BigNumber.from('0x' + uuid + ethers.utils.hexZeroPad('0x0', 16).slice(2));
  id = id.add(which);
  return id;
}

export function receiptHexUUID(event, which = 1) {
  return uuidFromIdentity(event.identity).replace(/-/g, '');
}

/**
 * split a token id into [uuid, nonce] where uuid will be a uuid style
 * hyphenated hex string and nonce will be a a number. The id is typically an
 * event or an asset identity
 * 
 * @param {string|ethers.BigNumber|BigInt} id 
 * @returns [string, Number]
 */
export function splitTokenID(id) {

	const origId = id;
	id = bigishToHex(id).slice(2);

	if (id.length != 64) throw new Error(`invalid id ${origId} hex form length != 64`);

	const uuid = [
		id.slice(0, 8),
		id.slice(8, 12),
		id.slice(12, 16),
		id.slice(16, 20),
		id.slice(20, 32)
	].join("-");

	const nonce = Number(id.slice(32)); // we expect this to be in javascript number range
	return [uuid, nonce];
}

export function uuidFromIdentity(identity) {
	const parts = identity.split('/');
	return (parts.length && parts[parts.length - 1]) || identity;
}

export function uuidAbbrev(uuid) {
	return uuid.slice(0, 6) + '...' + uuid.slice(uuid.length - 3);
}

export function identityAbbrev(identity) {
	return uuidAbbrev(uuidFromIdentity(identity));
}
