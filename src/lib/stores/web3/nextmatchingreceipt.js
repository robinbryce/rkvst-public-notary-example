import { readable } from 'svelte/store';
import { parseEventLog } from '$lib/web3/eventhandler.js';
import { awaitIfNecessary } from '$lib/idioms.js';

const log = console;

/**
 * Creates a store whose value is the next transaction that contains a matching
 * log event (in ledger order) that was recorded on the chain. This relies on
 * ethers log filtering and it should be noted that ethers "looks back" a bit to
 * reduce the likelyhood of un-expectedly missed events. Use matchFirstReceipt
 * to pre-flight guard use of this if that matters.
 * 
 * @param {any} contract ethers contract instance
 * @param {any} signature solidity event topic signature eg 'TransferSingle'
 * @param {any[]} args arguments for building the topic filter (ethers filter construction)
 */
export function nextMatchingReceipt(matcher, contract, signature, ...args) {

  // If the event is not found, create a listener that automatically stops
  // listening after the first value is received.
  return readable(undefined, function start(set) {

    let filter = contract.getFilter(signature, ...args);
    let listener;

    function stop() {
      if (!listener) {
        log.debug(`stop - already stopped for ${signature}`);
        return;
      }
      log.debug(`stopping ${signature}`);
      contract.off(filter, listener);
      log.info(`stopped ${signature}`);
      listener = undefined;
    }

    async function _listener(args) {
      if (!listener)
        return;

      if (args.length === 0) {
        log.info("bad callback from ethers, args empty");
        return;
      }

      const ethlog = args[args.length - 1];
      let event = parseEventLog(contract, ethlog);
      if (event)
        event = await awaitIfNecessary(matcher, event);
      if (!event) {
        log.debug("result not matched, continuing")
        return;
      }

      // always stop after first match regardless of parsing result.
      stop();

      // An undefined result means an error of some kind was caught and logged.
      if (!event)
        return;

      const receipt = await ethlog.getTransactionReceipt();
      if (!receipt)
        return;

      set({receipt, event});
    }

    log.info(`firstMatchingReceipt# starting listener for ${signature} [${JSON.stringify(args)}]`);

    // initialise listener before setting off the initial queryFilter
    listener = (...args) => _listener(set, ...args);

    // If we didn't support the match callback we could just use contract.once here, but as we cant tell how many we will skip over, we have to use 'on'
    contract.on(filter, _listener(set, ...args));
    return stop
  })
}