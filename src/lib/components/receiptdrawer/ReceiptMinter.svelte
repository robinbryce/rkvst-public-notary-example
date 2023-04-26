<ButtonWithPopover
  id="mint_receipt1"
  buttonText="Mint Receipt"
  handleClick={mintCurrentReceipt}>
  <svelte:fragment slot="pop">
		Mint an NFT for the receipt on polygon mumbai (testnet). copy your account
		address to the <a href="https://mumbaifaucet.com/">mumbai faucet</a> to
    get free test crypto to pay for the mint.
  </svelte:fragment>
</ButtonWithPopover>
<script>
	import * as env from '$env/static/public';

	import { ethers } from 'ethers';

  import ButtonWithPopover from "$lib/components/utility/ButtonWithPopover.svelte";

	import { selectedEvent } from '$lib/stores/events.js';
	import { selectedAsset } from '$lib/stores/assets.js';
	import { tokenContract } from '$lib/stores/tokencontract.js';

  export let receipt;
  export let eventDescription;
  export let worldRoot;
  export let minting = false;
	export let storeURL = '/api/nft-storage/store/metadata';

	function toIdentityURL(identity) {
		if (!(identity.startsWith("publicassets") || identity.startsWith("assets")))
			throw new Error(`invalid identity ${identity}`)
		// Note the PUBLIC here means PUBLIC in the vercel dot env sense, nothing to do with rkvst
		return env["PUBLIC_RKVST_URL"] + 'archivist/v2/' + identity
	}

	async function mintCurrentReceipt() {
		const c = $tokenContract;
		if (!c) {
			console.log(`no currently bound contract`);
			return;
		}
		if (!$receipt.receiptTokenProofs) {
			console.log(`proofs not available on receipt`);
			return;
		}
		const event = $selectedEvent;
		const asset = $selectedAsset;
		// Be super careful when minting, there are no take backs
		if (event.asset_identity !== asset.identity)
			throw new Error(`selected event and selected assets are out of whack`);

		const [assetUUID, eventUUID] = uuidsFromEvent(event.identity);
		const eventID = uuidToBig(eventUUID);

		const metadata = {
			title: 'RKVST Event receipt proof',
			name: event.event_attributes?.arc_display_name ?? 'An un-named event',
			description: `${eventDescription}`,
			external_url: toIdentityURL(event.identity),
			properties: {
				receipt_url: $receipt.ipfs.receipt_url,
				receipt_content_url: $receipt.ipfs.receipt_content_url,
				rkvst_event_url: toIdentityURL(event.identity),
				rkvst_asset_url: toIdentityURL(event.asset_identity)
			}
		};

		const body = {
			metadata
		};
		let options = {
			method: 'POST',
			headers: new Headers([['content-type', 'application/json']]),
			body: JSON.stringify(body)
		};

		let resp;
		minting = true;
		let data;
		try {
			console.log(`saving nft: ${storeURL}`);
			resp = await fetch(storeURL, options);
			data = await resp.json();
		} catch (err) {
			console.log(`ERROR: saving nft for ${event.identity} ${storeURL} ${resp.statusText} ${err}`);
			minting = false;
			throw err;
		}
    $receipt.updateMetadata(data.metadata);
		console.log(`nft metadata ${JSON.stringify($receipt.metadata, null, '  ')}`);
    console.log(JSON.stringify($receipt, null, '  '));
    console.log(`${eventID} ${$receipt?.metadata?.url} ${worldRoot}`);

		let tx;
		let r;
		try {
			tx = await c.createReceiptToken(
				eventID,
				data.metadata.url,
				ethers.utils.getAddress($receipt.payload.account),
				worldRoot,
				$receipt.receiptTokenProofs.rlpAccountProof,
				$receipt.receiptTokenProofs.storageProofs
			);
			r = await tx.wait();
			if (r.status !== 1) throw new Error(`bad status: ${JSON.stringify(r)}`);
			console.log(`transaction# ${r.transactionHash} ${eventID}`);
			// for (const log of r.logs) {
			// 	const event = facetInterfaces.ERC1155Facet.parseLog(log);
			// 	console.log(`${event.name}: ${JSON.stringify(event.args)}`);
			// }
		} catch (err) {
			console.log(`ERROR: minting nft for ${event.identity} ${storeURL} ${resp.statusText} ${err}`);
			minting = false;
			throw err;
		}

		minting = false;
	}

	function uuidsFromEvent(identity) {
		const parts = identity.split('/');
		if (parts[parts.length - 2] != 'events' || !parts[parts.length - 4].endsWith('assets'))
			throw new Error(
				`malformed identity ${identity} ${parts[parts.length - 1]} ${
					parts[parts.length - 4]
				} ${parts}`
			);
		return [parts[parts.length - 3], parts[parts.length - 1]];
	}

	function uuidToBig(uuid) {
		return BigInt('0x' + uuid.replace(/-/g, ''));
	}

</script>
