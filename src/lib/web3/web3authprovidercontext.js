import { ethers } from 'ethers';

import { EIP1193ProviderContext } from './eip1183providercontext.js';

const log = console;

export class Web3AuthModalProviderContext extends EIP1193ProviderContext {
	constructor(cfg = {}) {
		super(cfg);
		this.modalOpen = false;
		this.web3auth = undefined;
		this.web3AuthProvider = undefined;
		this.loggedIn = false;
	}

	/**
	 * For Web3 we start with a normal rpc provider. In resume, which is triggered
	 * on select, we initiate the web3auth flow.
	 * @returns
	 */
	async prepareProvider(switcher) {
		if (!switcher)
			throw new Error(`the web3auth provider context requires access to the switcher here`);

		// This is the right point to fetch remote config, but we don't need that for this demo
		await switcher.addNetwork(this.cfg);
		return this;
	}

	async resume(switcher) {
		if (!switcher)
			throw new Error(`the web3auth provider context requires access to the switcher here`);
		try {
			this.modalOpen = true;
			await this.web3auth.connect();
			this.loggedIn = true;
		} catch (err) {
			log.info(`ERROR: this.modal.connect: ${JSON.stringify(err)}, ${err}`);
		}
		this.modalOpen = false;
		const provider = new ethers.providers.Web3Provider(this.web3auth.provider);
		const prepared = await this.setProvider(provider);
		log.info(`web3auth signerAddress: ${this.signerAddress}`);
		// const address = await provider.getSigner()?.getAddress();
		const address = prepared.signerAddress;
		// const signer = provider.getSigner().constructor.name;
		const signerName = prepared.signer?.constructor?.name;

		log.info(`modal.provider.getAddress: ${address}`);
		console.log(`this.modal signer: ${signerName}, provider: ${provider.constructor.name}`);
		return prepared;
	}
}
