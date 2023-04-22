<script>
	import { ethers } from 'ethers';
	import * as env from '$env/static/public';
	import { invalidate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { Button } from 'flowbite-svelte';
	import AssetsDrawer from '$components/assets/AssetsDrawer.svelte';
	import ReceiptDrawer from '$lib/components/receiptdrawer/ReceiptDrawer.svelte';
	import SelectedAssetCard from '$components/assets/SelectedAssetCard.svelte';
	import SelectedEventsCard from '$components/events/SelectedEventsCard.svelte';
	import Web3AuthProvider from '$lib/components/web3/Web3AuthProvider.svelte';

	import { Web3AuthModalSingleton } from '$lib/web3/web3authsingleton.js';
	import { Web3AuthModalProviderContext } from '$lib/web3/web3authprovidercontext.js';
	import { wrapEventHandler } from '$lib/web3/eventhandler.js';
	import { createProxy as createDiamondProxy } from '$lib/web3/rkvsteventtokens.js';

	import { signerAddress } from '$lib/stores/signeraddress.js';
	import { selectedAsset } from '$lib/stores/assets.js';
	import { tokenContract } from '$lib/stores/tokencontract.js';
	import { currentUserInfo } from '$lib/stores/web3userinfo.js';

	const RKVST_URL = env['PUBLIC_RKVST_URL'];
	const refreshInterval = env['PUBLIC_RKVST_IO_REFRESH_DEFAULT'] ?? 12000;
	const tokenContractAddress = env['PUBLIC_MUMBAI_RKVST_EVENT_TOKENS_ADDRESS'];

	export let data; // layout.server.js loads this

	let assetsDrawerHidden = true;
	let receiptDrawerHidden = true;
	let drawerButtonText = 'Select Asset';
	let selectedAssetName;
	let selectedIdentity;
	let web3auth;

	// TransferSingle listening, to keep track of receipts
  let filter = undefined;
  let listener = undefined;
  let listeningOn = undefined;

	$: {
		if ($selectedAsset) {
			selectedAssetName = $selectedAsset.attributes?.arc_display_name;
			selectedIdentity = $selectedAsset.identity;
			drawerButtonText = `Change Asset (${selectedAssetName})`;
		} else {
			drawerButtonText = 'Select Asset';
		}
	}

 	tokenContract.subscribe(async (c)=>{
    stopListening();
    if (!c) {
      return;
    }
		console.log(`+page.svelte# tokenContract.subscribe creating filter`);
		const address = await c.signer?.getAddress();
		if (!address) {
			console.log(`signer address not available on contract instance for ${c.address}`);
			return;
		}

    // Filter for any mints to the current signer.
		const signature = 'TransferSingle(address,address,address,uint256,uint256)'
		// const signature = 'TransferSingle'
		console.log(`+page.svelte# tokenContract.subscribe getting filter for "${signature}" [null, ${ethers.constants.AddressZero}, ${address}]`);
		console.log(`+page.svelte# tokenContract.subscribe getFilter ${c.getFilter?.constructor?.name} ${c.getFilter}`);
    filter = c.getFilter(
      signature,
      null,
      ethers.constants.AddressZero,
			address
    );

		console.log(`+page.svelte# tokenContract.subscribe wrapping handler`);
    listener = wrapEventHandler(c, handleTransferSingle);
		console.log(`+page.svelte# tokenContract.subscribe wrapped handler`);
    c.on(filter, listener);
    listeningOn = c;
		console.log(`+page.svelte# tokenContract.subscribe listening for ${signature}[null, ${ethers.constants.AddressZero}, ${address}]`);
  });

	// invalidate only makes sense from the client end
	onMount(async () => {
		if (data?.web3auth?.chains?.length) {
			web3auth = new Web3AuthModalSingleton({
				authenticated: (state, current) => {
					console.log(`+page.svelte# authenticated ${state} ${current.name}`);
					currentUserInfo.set(state ? current : undefined);
				},
				signerChanged
			});
			await web3auth.prepare(
				data?.web3auth?.chains ?? [],
				(cfg) => new Web3AuthModalProviderContext({ ...cfg, signerChanged }),
				{ web3authOptions: () => data.web3auth.options ?? {} }
			);
			for (const cfg of data?.web3auth?.chains ?? []) await web3auth.addNetwork(cfg);
		}
		setInterval(async () => {
			invalidate('app:assets');
		}, refreshInterval);
	});

  onDestroy(()=>{
    stopListening();
  })

  function stopListening() {
    if (filter && listeningOn && listener) {
      listeningOn.off(filter, listener);
      filter = listener = listeningOn = undefined;
    } 
  }

  function handleTransferSingle(event) {
		console.log(`${event.name} ${event.signature} ${JSON.stringify(event.args)}`);
  }
	function signerChanged(signer, address) {
		if ($signerAddress === address && $tokenContract) {
			console.log(`+page.svelte# signerChanged notification for ${signerAddress}`);
			return;
		}
		console.log(`+page.svelte# signerChanged ${address} re-binding signer ? ${!!signer}`);
		if (!signer) {
			tokenContract.set(undefined);
			return;
		}

		console.log(`+page.svelte# signerChanged binding contract @${tokenContractAddress} for signer "${address}"`);
		const c = createDiamondProxy(tokenContractAddress, signer);
		console.log(`+page.svelte# signerChanged instance: ${c}`);
		// tokenContract.set(c);
		// signerAddress.set(address)
		$tokenContract = c;
		$signerAddress = address;
		console.log(`+page.svelte# signerChanged done`);
	}
</script>

<Navbar let:hidden let:toggle>
	<NavBrand href="/">
		<img
			src="https://app.rkvst.io/dist/assets/icons/rkvst-32x32.png"
			class="mr-3 h-6 sm:h-9"
			alt="RKVST Logo"
		/>
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
			API Demo
		</span>
	</NavBrand>
	<NavHamburger on:click={toggle} />
	<NavUl {hidden}>
		<NavLi>
			<div class="text-center">
				<Button on:click={() => (assetsDrawerHidden = !assetsDrawerHidden)}
					>{drawerButtonText}</Button
				>
			</div>
		</NavLi>
		<NavLi href="/" active={true}>Home</NavLi>
		<NavLi href={RKVST_URL} target="_blank">The RKVST</NavLi>
		<NavLi><Web3AuthProvider bind:chainswitch={web3auth} /></NavLi>
	</NavUl>
</Navbar>

<AssetsDrawer
	publicAssets={data.public_assets}
	assets={data.assets}
	bind:hidden={assetsDrawerHidden}
/>
<ReceiptDrawer bind:hidden={receiptDrawerHidden} />
<div class="flex justify-center gap-4 pt-10 w-full">
	<div><SelectedAssetCard asset={$selectedAsset} /></div>
	<!-- ... -->
	<div class="w-1/4">
		<SelectedEventsCard asset={$selectedAsset} events={[]} bind:receiptDrawerHidden />
	</div>
</div>
