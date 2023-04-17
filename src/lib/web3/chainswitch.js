import { isUndefined } from "../idioms.js";

const log = console;

export class ChainSwitch {
  constructor(cfg = {}) {
    this.cfg = cfg;
    this.available = {};
    this.current = undefined;
  }

  getCurrent() {
    return this.available?.[this.current];
  }

  /** get the context. throw an error if it is not available. intended for derived implementations of select */
  requireContext(name) {
    const ctx = this.available[name];
    if (!ctx) {
      throw new Error(`provider ${name} is not currently available`);
    }
    return ctx;
  }

  /** impotently stopListening on the current context. intended for derived
   * implementations of select */
  stopCurrent() {
    const currentCtx = this.getCurrent();
    if (currentCtx) {
      currentCtx.stopListening();
      this.current = undefined;
    }
  }
  async stopAll() {
    for (const [name, ctx] of Object.entries(this.available)) {
      ctx.reset();
    }
    this.available = {};
    this.current = undefined;
  }

  async prepare(cfgs, contextfactory, opts) {
    this.available = await this.beginPrepare(cfgs, contextfactory, opts);
  }

  async beginPrepare(cfgs, contextfactory, opts) {
    await this.stopAll();

    const { fetch } = opts;

    const prepared = {};
    const preparing = [];

    // Take the injected providers as is. Accumulate an array of promises for the
    // rest
    for (let each of Object.values(cfgs)) {
      if (each.fetch && !fetch) {
        log.info(
          `fetch config '${each.name}' skipped - fetching provider configs is not enabled`
        );
        continue;
      }
      const ctx = contextfactory({ ...each /* the place to wire in eip11934 provider callbacks */});
      preparing.push(ctx.prepareProvider(this));
    }

    if (preparing.length === 0) {
      return prepared;
    }

    // Resolve the promises for rpc providers
    return Promise.all(
      preparing.map((p) =>
        p.catch((e) => log.info(`unexpected error checking provider: ${e}`))
      )
    )
      .then((values) => {
        for (const ctx of values) {
          if (isUndefined(ctx)) continue;
          log.debug(`adding provider ${ctx.cfg.name} ${ctx.cfg.url}`);
          prepared[ctx.cfg.name] = ctx;
          ctx.stopListening();
        }
        return prepared;
      })
      .catch((e) => {
        log.info(`unexpected error checking providers: ${e}`);
        return prepared;
      });
  }

}