import { readable } from 'svelte/store';
import { parseEventLog } from '$lib/web3/eventhandler.js';
import { awaitIfNecessary } from '$lib/idioms.js';

const log = console;

/**
 * Creates a store whose value is the first transaction that contains a matching
 * log event (in ledger order) that was recorded on the chain. If the event is
 * already present on the contract, its value is the stores initial value and
 * the store will not update that value.  If the event is not available a filter
 * listener is added to the provider.  If/when it fires, the store value is set
 * 
 * @param {any} contract ethers contract instance
 * @param {any} signature solidity event topic signature eg 'TransferSingle'
 * @param {any[]} args arguments for building the topic filter (ethers filter construction)
 */
export function firstMatchingReceipt(matcher, contract, signature, ...args) {

  // If the event is not found, create a listener that automatically stops
  // listening after the first value is received.
  return readable(undefined, function start(set) {

    let filter = contract.getFilter(signature, ...args);
    let listener;

    // there is sort of a race here, but ethers accounts for that by listening
    // 'back a little'. if we are looking for first match this behaviour is
    // ideal as the dups don't matter.

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

    async function _listener(set, args) {
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

    (async ()=>{
      // If the first matching event is already available set that as the store
      // value. it is effectively constant in this case.
      const found = await contract.queryFilter(filter);
      if (!listener) {
        log.debug(`firstMatchingReceipt# queryFilter lost the race (this is ok)`);
        return;
      }
      if (found.length > 0) {
        for (const ethlog of found) {
          let event = parseEventLog(contract, ethlog)
          try {
            event = awaitIfNecessary(matcher, event);
            if (!event) {
              continue
            }
          } catch (err) {
            log.info(`firstMatchingReceipt# match callback error ${err} for ${JSON.stringify(event)}`);
            continue;
          }
          const receipt = await ethlog.getTransactionReceipt();
          if (!receipt)
            return;

          log.debug(`firstMatchingReceipt# query found pre-existing match for ${signature} [${JSON.stringify(args)}] => ${JSON.stringify(event)}`);
          set({receipt, event});
          stop();
        }
      }
    })();

    contract.on(filter, listener);
    return stop
  })
}