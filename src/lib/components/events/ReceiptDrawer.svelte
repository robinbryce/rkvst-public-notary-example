<script>
	import { Drawer, CloseButton } from 'flowbite-svelte';
	import { Button } from 'flowbite-svelte';
	import { Spinner } from 'flowbite-svelte';
	import { Popover } from 'flowbite-svelte';

	import { sineIn } from 'svelte/easing';

	import EventDescription from '$lib/components/events/EventDescription.svelte';
	import ReceiptView from '$lib/components/events/ReceiptView.svelte';

	import { selectedEvent } from '$lib/stores/events.js';
	import { selectedAsset } from '$lib/stores/assets.js';

	import { getReceipt } from '$lib/rkvstapi/getreceipt.js';
	import { getBlock } from '$lib/rkvstapi/getblock';

	export let hidden = true;

	// state
	let receipt = undefined;
  let receiptEncodings = undefined;
  let savedReceipt = undefined;
	let worldRoot = undefined;
	let receiptBlock = undefined;
	let gettingReceipt = false;
	let savingReceipt = false;

	// fixed configuration
	// let activateClickOutside = false
	let backdrop = false;
	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	// derived content
	let defaultImage =
		'https://nftstorage.link/ipfs/bafybeia7mydteutimc7j7urkk3vnjo2ndkrvoujijbth2kgzuffa6wznjm/game-icon.png';
	let image = $selectedEvent?.event_attributes?.token_image;
	if (!image) image = $selectedAsset?.attributes?.token_collection_image;
	image = image ?? defaultImage;

	// ----
	async function saveCurrentReceipt() {
    console.log(`saveCurrentReceipt: ${savingReceipt} ${receiptEncodings?.base64}`);
		if (savingReceipt) return;
		if (!receiptEncodings?.base64) return;

		const body = {
			receipt_base64: receiptEncodings.base64
		};
		let options = {
			method: 'POST',
			headers: new Headers([['content-type', 'application/json']]),
			body: JSON.stringify(body)
		};

		let url = '/api/nft-storage/store/receipt';

		let resp;
		savingReceipt = true;
		try {
      console.log(`saving receipt: ${url}`);
			resp = await fetch(url, options);
			savedReceipt = await resp.json();
		} catch (err) {
			console.log(`ERROR: saving receipt for ${eventIdentity} ${url} ${resp.statusText} ${err}`);
			throw err;
		}
		console.log(`saved receipt ${JSON.stringify(savedReceipt, null, '  ')}`);
		savingReceipt = false;
	}

	async function getSelectedEventReceipt() {
		if (gettingReceipt) return;

		const event = $selectedEvent;
		if (!event) return;
		const blockNumber = $selectedEvent.block_number;
		if (!blockNumber) return;

		gettingReceipt = true;
		try {
			// get the world root first, this verifies we have a valid block.
			receiptBlock = await getBlock(blockNumber);
		} catch (err) {
			console.log(`ERROR: error getting block ${err}`);
			gettingReceipt = false;
			return;
		}

		// RKVST runs go-quorum based ledgers and utilises their private state
		// feature to provide auditability and confidentiality at the same time.
		//
		// Each node in a quorum network puts private transaction data in a node
		// specific merkle tree. The hash of the private transaction is committed to
		// the public (ethereum) world sate. For that reason we need the
		// privateStateRoot to verify the proofs. For any private transaction it is
		// always possible to check that is hash is in the public state. But it is
		// un-necessary to do so.
		//
		// Note that public events are recorded using private transactions that are
		// 'shared' with the configured public node. All events, for both restricted
		// and public events, are recorded on the quorum blockchain using private
		// transactions.
		worldRoot = receiptBlock.privateStateRoot;
		// this can take a second or so
		try {
			receipt = await getReceipt(event.identity, blockNumber);
		} catch (err) {
			console.log(`ERROR: error getting receipt ${err}`);
		}
		gettingReceipt = false;
	}
</script>

<Drawer
	placement="right"
	width="w-1/3"
	{backdrop}
	transitionType="fly"
	{transitionParams}
	bind:hidden
	id="sidebar11"
>
	<div class="flex text-center">
		<div class="flex mb-4 mr-4 -space-x-4">
			<img
				class="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800"
				src={image}
				alt=""
			/>
		</div>

		<h5
			id="drawer-label"
			class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
		>
			<p class="mr-3">Get a receipt</p>
		</h5>

		<CloseButton on:click={() => (hidden = true)} class="mb-4 dark:text-white" />
	</div>
	<br />
	<div
		class="mb-3 p-2 rounded-md dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight"
	>
		<div class="m-1">
			<EventDescription event={$selectedEvent} />
		</div>
	</div>

	<div
		class="mb-3 p-2 rounded-md dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-400 leading-tight"
	>
		{$selectedEvent?.identity}
	</div>
	{#if !receipt}
		<Button
			id="get_receipt1"
			class="w-full mb-2"
			on:click={async () => await getSelectedEventReceipt()}>Get Receipt</Button
		>
		<Popover class="w-96 text-sm font-light " triggeredBy="#get_receipt1">
			Fetch an off line verifiable receipt for an RKVST event from the RKVST
		</Popover>
	{:else if !savedReceipt}
    <!-- TODO: XXX warning about the consequence, and also use case, for
    publicly sharing the proofs of a restricted event.  Ie, this is feature
    where a customer can *chose* on a per event basis to share an event
    publicly and in an independently verifiable way. -->
		<Button id="save_receipt1" class="w-full mb-2" on:click={async () => await saveCurrentReceipt()}
			>Save Receipt</Button
		>
		<Popover class="w-96 text-sm font-light " triggeredBy="#save_receipt1">
			Save the receipt to ipfs
		</Popover>
	{/if}
	{#if (gettingReceipt || savingReceipt)}
		<div
			class="mb-3 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight"
		>
			<p>{gettingReceipt ? 'fetching receipt' : 'saving receipt'}</p>
			<Spinner />
		</div>
  {/if}
	<ReceiptView bind:receipt bind:worldRoot bind:receiptEncodings bind:savedReceipt />
</Drawer>
