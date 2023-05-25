import { awaitable } from "$lib/idioms.js";

const log = console;

export function parseEventLog(contract, ev) {
  let iface;
  // ask the proxy for the appropriate decoding interface
  try {
    iface = contract.getEventInterface(ev); // throws
  } catch (err) {
    log.info(`event ${JSON.stringify(ev)} interface not found: ${err}`);
    log.info(`event ${ev?.topics?.[0]} not found: ${err}`);
    return;
  }

  let parsed;
  try {
    parsed = iface.parseLog(ev);
  } catch (err) {
    log.info(`error parsing event from ethers: ${ev}: ${err}`);
    return;
  }
  ev.name = parsed.name;
  ev.event = parsed.name;
  ev.signature = parsed.signature;
  ev.args = parsed.args;
  ev.topic = parsed.topic;
  return ev;
}

export function wrapEventHandler(contract, handler) {
    const wrapped = async (...args) => {
      if (args.length === 0) {
        log.info("bad callback from ethers, args empty");
        return;
      }

      const ev = parseEventLog(contract, args[args.length - 1]);

      // log.debug({ name: ev.name, args: JSON.stringify(ev.args) });
      if (awaitable(handler))
        return await handler(ev);
      return handler(ev);
    };
    return wrapped;
}