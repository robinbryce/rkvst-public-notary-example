// For the purposes of this demo we pre fetch all the data we need from the
// rkvst on page load. Specifically,
// * config has the public asset identities we configured in the RKVST app registration custom claims
// * public_assets has each of those assets
// * web3auth chain configurations
import * as env from '$env/static/public';
const configPath = '/api/config';
const publicAssetsPath = '/api/rkvst/io/archivist/publicassets';
const assetsPath = '/api/rkvst/io/archivist/v2/assets';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, depends }) {
	depends('app:assets');

	const resp = await fetch(configPath);
	const config = await resp.json();

	const public_assets = fetchassets(fetch, config?.public_assets ?? [], publicAssetsPath);
	const assets = fetchassets(fetch, config?.assets ?? [], assetsPath);

	const chains = [
		{
			name: 'polygon',
			description: 'Mumbai Testnet replicates the Polygon Mainnet and is used for testing',
			chainConfig: {
				chainNamespace: 'eip155'
			},
			chainId: 80001,
			currency: 'MATIC',
			url: env['PUBLIC_MUMBAI_URL'],
			polling: env['PUBLIC_MUMBAI_POLLING'] ?? 2000,
			rkvstEventTokensAddress: env['PUBLIC_MUMBAI_RKVST_EVENT_TOKENS_ADDRESS'],
			openseaAssetsURL: env['PUBLIC_MUMBAI_OPENSEA_ASSETS_URL']
		}
	];

	return {
		config,
		public_assets,
		assets,
		web3auth: {
			options: {
				clientId: env['PUBLIC_WEB3AUTH_CLIENT_ID'],
				web3AuthNetwork: 'testnet',
				authMode: 'DAPP'
			},
			chains
		}
	};
}

async function fetchassets(fetch, uuids, basePath) {
	const assets = [];
	for (const uuid of uuids) {
		const path = basePath + '/' + uuid;
		const resp = await fetch(path);
		if (resp.status !== 200) {
			console.log(`status ${resp.status} for ${path}`);
			continue;
		}
		const data = await resp.json();
		assets.push(data);
	}

	return assets;
}
