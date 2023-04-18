import { ethers } from 'ethers';
import pkg2 from '@web3auth/modal';
const { Web3Auth } = pkg2;

import { awaitable, isFunction } from '../idioms.js';
import { ChainSwitch } from './chainswitch.js';

const log = console;

/**
 * Web3ModalSingleton adds support for cfg.type.startsWith('web3auth')
 * It deals with the fact that Web3Modal must be instanced as a singleton
 */
export class Web3AuthModalSingleton extends ChainSwitch {
	constructor(cfg = {}) {
		super(cfg);

		this.available = {};
		this.current = undefined;
		this.currentUserInfo = undefined;

		this.web3authOptions = undefined;
		this._promisedWeb3Auth = undefined;
		this.web3auth = undefined;
		this.web3authChains = {};
		this.modalOpen = false;
		this.loggedIn = false;
		this.web3AuthProvider = undefined;

		const { authenticated, signerChanged } = cfg;

		this.authenticated = async (state) => {
			log.info(`Web3ModalSingleton#authenticated ${state}`);
			this.currentUserInfo = await this.web3auth?.getUserInfo();
			if (!authenticated) return;
			try {
				return authenticated(state, this.currentUserInfo);
			} catch (err) {
				log.info(`ERROR: Web3ModalSingleton#authenticated ${err}`);
			}
		};

		this.signerChanged = async (signer, signerAddress) => {
			log.info(`Web3ModalSingleton#signerChanged ${signerAddress}`);
			this.currentUserInfo = await this.web3auth?.getUserInfo();
			if (authenticated) {
				try {
					if (awaitable(authenticated)) authenticated(this.loggedIn, this.currentUserInfo);
					else authenticated(this.loggedIn, this.currentUserInfo);
				} catch (err) {
					log.info(`ERROR: Web3ModalSingleton#signerChanged (1) ${err}`);
				}
			}

			if (signerChanged) {
				try {
					if (awaitable(signerChanged)) await signerChanged(signer, signerAddress);
					else signerChanged(signer, signerAddress);
				} catch (err) {
					log.info(`ERROR: Web3ModalSingleton#signerChanged (2) ${err}`);
				}
			}
		};
	}

	/** Avoid forcing the dependency choice in this file, and also make this completely mockable */
	newWeb3Auth(cfg) {
		return new Web3Auth(cfg);
	}

	networks() {
		const available = [];
		for (const ctx of Object.values(this.available)) available.push(ctx.cfg);
		return available;
	}

	contexts() {
		const available = [];
		for (const ctx of Object.values(this.available)) available.push(ctx);
		return available;
	}

	async select(name) {
		const newCtx = this.requireContext(name);
		this.stopCurrent();

		const chainConfig = this.web3authChains[name];
		let chainId = chainConfig?.chainId;
		if (!chainId) {
			log.info(`Web3ModalSingleton#select: selecting non web3auth provider config ${name}`);
			await newCtx.resume(this);
			this.current = name;
			return newCtx;
		}
		chainId = ethers.utils.hexlify(chainId);

		log.info(`Web3ModalSingleton#select: selecting ${name} ${chainId}`);
		if (!this.isLoggedIn()) {
			await this.login();
		}

		// addChain is deferred until this point because it requires a logged in
		// modal. And we don't want to trigger login on page load (when the
		// providers are initialy discovered).
		if (chainConfig.addPending) {
			delete chainConfig.addPending;
			try {
				await this.web3auth.addChain(chainConfig);
			} catch (err) {
				chainConfig.addPending = true;
				log.info(`ERROR:Web3ModalSingleton#select: addChain ${err}`);
				return;
			}
		}

		await this.web3auth.switchChain({ chainId });
		const provider = new ethers.providers.Web3Provider(this.web3auth.provider);
		await newCtx.setProvider(provider);
		const signer = provider.getSigner();
		const signerAddress = await signer.getAddress();
		this.current = name;
		log.info(`Web3ModalSingleton#select: provider signerAddress ${signerAddress}`);
		await this.signerChanged(signer, signerAddress);
	}

	isLoggedIn() {
		return this.loggedIn;
	}

	async login(force) {
		if (this.modalOpen) {
			log.info(`Web3ModalSingleton#login modal is already open`);
			return;
		}
		if (!this.web3auth) {
			log.info(`Web3ModalSingleton#login modal instance is undefined`);
			return;
		}
		if (this.loggedIn && !force) {
			log.info(`Web3ModalSingleton#login already logged in`);
			return;
		}
		try {
			this.modalOpen = true;
			await this.web3auth.connect();
			this.loggedIn = true;
			this.authenticated(this.loggedIn);
		} catch (err) {
			log.info(`ERROR: Web3ModalSingleton#login - calling connect: ${JSON.stringify(err)}, ${err}`);
		}
		this.modalOpen = false;
	}

	logout() {
		if (!this.web3auth) {
			log.info(`no web3auth modal instance to do logout with`);
			return;
		}
		if (!this.loggedIn) {
			log.info(`not logged in`);
			return;
		}
		this.web3auth.logout();
		this.loggedIn = false;
		this.currentUserInfo = undefined;
		this.authenticated(this.loggedIn);
		(async () => await this.signerChanged(undefined, undefined))();
		log.info(`Web3AuthModalProviderContext#logout ok`);
	}

	/**
	 * Ensures there is only one call to initModal, whilst allowing most of the
	 * provider configration to happenin paralalel
	 */
	async initSingletonWeb3Auth(chainConfig) {
		if (this.web3auth) return false;

		let creator = false;
		if (!this._promisedWeb3Auth) {
			creator = true;
			// This is async, but we will have multiple waiters
			this._promisedWeb3Auth = this._initWeb3Auth(chainConfig);
		}

		try {
			await this._promisedWeb3Auth;
			// <-- re-entrancy can happen after this point
		} catch (err) {
			log.debug(
				`ERROR: Web3ModalProviderSwitch#initSingletoneWeb3Auth: await this._promisedWeb3Auth ${err}`
			);
		}
		if (creator) {
			delete this._promisedWeb3Auth;
		}
		// guarantee all callers that the instance is available on return
		if (!this.web3auth)
			throw new Error(
				`ERROR: Web3ModalProviderSwitch#initSingletonWeb3Auth promised web3auth instance missing`
			);

		return creator;
	}

	/**
	 * DO NOT call directly, see initSingletonWeb3Auth
	 * @param {*} chainConfig
	 * @returns
	 */
	async _initWeb3Auth(chainConfig) {
		if (this.web3auth) return;

		log.debug(
			`Web3ModalProviderSwitch#_initWeb3Auth: creating Web3Auth and calling initModal for ${chainConfig.chainId}`
		);
		if (isFunction(this.web3authOptions)) {
			log.debug(`Web3ModalProviderSwitch#_initWeb3Auth: call this.web3authOptions`);
			this.web3authOptions = this.web3authOptions();
		}
		// allow for functions returning promises.
		if (awaitable(this.web3authOptions)) {
			log.debug(`Web3ModalProviderSwitch#_initWeb3Auth: await this.web3authOptions`);
			this.web3authOptions = await this.web3authOptions();
		}
		if (!this.web3authOptions?.clientId || !this.web3authOptions?.web3AuthNetwork)
			throw new Error(
				`clientId and web3AuthNetwork must be present on the web3auth options: have "${Object.keys(
					this.web3authOptions
				)}"`
			);

		console.log(`
---- new Web3Auth & initModal
${JSON.stringify(this.web3authOptions)}
--
${JSON.stringify(chainConfig)}
----
`);

		const web3auth = this.newWeb3Auth({
			...this.web3authOptions,
			chainConfig: chainConfig
		});
		await web3auth.initModal();
		this.web3auth = web3auth;
	}

	/** Impotently add a network configuration. If the configuration provides a
	 * web3auth chainConfig with at least chainSpace set, the network is added to
	 * the Web3Modal instance. The first such configuration triggers instantiation
	 * and initModal for Web3Auth. */
	async addNetwork(cfg) {
		if (!cfg.chainConfig?.chainNamespace) {
			log.debug(
				`Web3ModalProviderSwitch#addNetwork: ${cfg.name} is not configured for web3auth (no chainSpace set)`
			);
			return;
		}

		log.info(`Web3ModalProviderSwitch#addNetwork: considering config ${cfg.name}`);
		if (this.web3authChains[cfg.name]) {
			log.info(`Web3ModalProviderSwitch#addNetwork: ${cfg.name} already known`);
			return;
		}

		const chainConfig = {
			chainId: ethers.utils.hexlify(cfg.chainId),
			chainNamespace: cfg.chainConfig.chainNamespace,
			displayName: cfg.description,
			rpcTarget: cfg.url,
			ticker: cfg.currency,
			tickerName: cfg.currency,
			...cfg.chainConfig // allow it to override the defaults from the primary config.
		};
		log.info('----------');
		log.info('web3auth chainConfig');
		log.info(JSON.stringify(chainConfig, null, '  '));
		log.info('----------');

		const creator = await this.initSingletonWeb3Auth(chainConfig);
		if (creator) {
			// IF this call created then the chainConfig does not need to be added, it was provided to the constructor.
			log.debug(`Web3ModalProviderSwitch#addNetwork: initModal complete for ${cfg.name}`);
			this.web3authChains[cfg.name] = chainConfig;
			log.debug(`Web3ModalProviderSwitch#addNetwork: initial network for web3auth ${cfg.name}`);
			return;
		}

		log.debug(
			`Web3ModalProviderSwitch#addNetwork: adding chain ${cfg.name} ${chainConfig.chainId} to web3auth for ${cfg.name}`
		);
		// await this.web3auth.addChain(chainConfig);
		chainConfig.addPending = true;
		this.web3authChains[cfg.name] = chainConfig;
		log.debug(`Web3ModalProviderSwitch#addNetwork: added network to web3auth for ${cfg.name}`);
	}

	/**
	 * Note that opts must include a callback which delivers a valid web3auth config
	 * See: Web3AuthOptions here https://web3auth.io/docs/sdk/web/modal/initialize
	 *      Only a chainId and chainNamespace are required. The other options are provider/chain specific.
	 * @param {*} cfgs
	 * @param {*} contextfactory
	 * @param {*} opts
	 * @returns
	 */
	async prepare(cfgs, contextfactory, opts) {
		const { web3authOptions } = opts;

		this.web3authOptions = web3authOptions;
		return super.prepare(cfgs, contextfactory, opts);
	}
}
