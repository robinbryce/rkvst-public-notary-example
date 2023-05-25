import {ethers} from 'ethers';
import { parseEventLog } from '$lib/web3/eventhandler.js';
import { awaitIfNecessary, bigishToHex } from '$lib/idioms.js';
import * as erc1155 from '$lib/web3/erc1155.js';

const log = console;

/**
 * return the parsed log from the receipt logs that matches the topic[0]
 * signature (in human form). Or undefined if no match.
 * @param {ethers.TrnasactionReceipt} receipt 
 * @param {string} signature 
 * @param {ethers.Interface} contract 
 * @returns 
 */
export function receiptLogBySignature(receipt, signature, contract) {
  const matchTopic = ethers.utils.id(ethers.utils.EventFragment.fromString(signature).format());
  for (const log of receipt.logs) {
    if (log.topics[0] !== matchTopic) continue

    return parseEventLog(contract, log);
  }
}

function stripHexPrefix(value) {
  if (value.startsWith('0x')) return value.slice(2);
  return value;
}

/**
 * return a match function which exactly matches events with an args.id equal to the argument id.
 * @param {ethers.BigNumber|BigInt|string} id 
 * @returns {Function}
 */
export function createExactTokenMatcher(id) {
  id = bigishToHex(id);

  return (/** @type {{ args: { id: { toHexString: () => any; }; }; }} */ event) => {
    if (event?.args?.id.toHexString() === id) {

      log.info(`createExactTokenMatcher# matched ${event?.args?.id?.toHexString()} == ${id}`);
      return event;
    }
    log.info(`createExactTokenMatcher# ${event?.args?.id?.toHexString()} != ${id}`);
    return undefined;
  }
}

/**
 * Return a match function which matches the most significant (left most)
 * *bytes* of the id against the same bytes in an event.args.id Used to match
 * split ERC 1155 token identities on the most significant bytes. Defaults to
 * the most significant 16 bytes.
 * @param {ethers.BigNumber|BigInt|string} id
 * @param {Number} significantBytes number of most significant *bytes* to match, default is the high half of the id space.
 * @returns {Function}
 */
export function createTokenMSBMatcher(matchTarget, significantBytes=16) {
  if (significantBytes > 32) throw new Error(`significantBytes ${significantBytes} must not exceed 32`);
  matchTarget = stripHexPrefix(matchTarget);

  if (matchTarget.length != significantBytes * 2)
    throw new Error(`matchTarget length must be 2 x significantBytes`);

  return (/** @type {{ args: { id: { toHexString: () => any; }; }; }} */ event) => {
    const candidateId = stripHexPrefix(event?.args?.id.toHexString());
    // @ts-ignore
    const matchCandidate = candidateId.slice(0, significantBytes * 2);
    if (matchCandidate === matchTarget) {

      log.debug(`createTokenMSBMatcher# matched ${candidateId} MATCHED ${matchTarget}`);
      return event;
    }
    log.debug(`createTokenMSBMatcher# ${candidateId} no match for ${matchTarget}. != ${matchCandidate}`);
    return undefined;
  }
}

/**
 * matchFirstReceipt finds the first event to satisfy the matcher and returns
 * the receipt for its transaction.
 * @param {*} matcher 
 * @param {*} contract 
 * @param {*} signature 
 * @param  {...any} args 
 */
export async function matchFirstReceipt(matcher, contract, signature, ...args) {

  let filter = contract.getFilter(signature, ...args);
  const found = await contract.queryFilter(filter);
  if (!found || found.length == 0) {
    log.info(`matchFirstReceipt# not match for ${signature}[${JSON.stringify(args)}]`);
    return;
  }

  for (const ethlog of found) {
    let event = parseEventLog(contract, ethlog)
    try {
      event = await awaitIfNecessary(matcher, event);
      if (!event) {
        continue
      }
    } catch (err) {
      log.info(`matchFirstReceipt# match callback error ${err} for ${JSON.stringify(event)}`);
      continue;
    }
    const receipt = await ethlog.getTransactionReceipt();
    if (!receipt) {
      log.info(`matchFirstReceipt# receipt not available for ${JSON.stringify(event)}`);
      return;
    }

    return {receipt, event}
  }
}

/**
 * matchLastReceipt finds the last event to satisfy the matcher and returns the
 * receipt for its transaction.
 * 
 * @param {*} matcher 
 * @param {*} contract 
 * @param {*} signature 
 * @param  {...any} args 
 */
export async function matchLastReceipt(matcher, contract, signature, ...args) {

  let lastMatch;
  let filter = contract.getFilter(signature, ...args);

  const found = await contract.queryFilter(filter);
  if (!found || found.length == 0) {
    log.info(`matchFirstReceipt# not match for ${signature}[${JSON.stringify(args)}]`);
    return;
  }

  for (const ethlog of found) {
    let event = parseEventLog(contract, ethlog)
    try {
      event = await awaitIfNecessary(matcher, event);
      if (!event) {
        continue
      }
    } catch (err) {
      log.info(`matchFirstReceipt# match callback error ${err} for ${JSON.stringify(event)}`);
      continue;
    }
    const receipt = await ethlog.getTransactionReceipt();
    if (!receipt) {
      log.info(`matchFirstReceipt# receipt not available for ${JSON.stringify(event)}`);
      return;
    }

    lastMatch = {receipt, event}
  }
  return lastMatch;
}
