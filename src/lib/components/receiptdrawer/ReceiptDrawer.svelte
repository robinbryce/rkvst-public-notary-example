<script>

	import { Drawer, CloseButton } from 'flowbite-svelte';
	import { Spinner } from 'flowbite-svelte';

	import { writable } from 'svelte/store';
	import { sineIn } from 'svelte/easing';

	import EventDescription from '$lib/components/events/EventDescription.svelte';
	import ReceiptView from '$lib/components/receiptdrawer/ReceiptView.svelte';
	import ReceiptGetter from '$lib/components/receiptdrawer/ReceiptGetter.svelte';
	import ReceiptSaver from '$lib/components/receiptdrawer/ReceiptSaver.svelte';
	import ReceiptMinter from '$lib/components/receiptdrawer/ReceiptMinter.svelte';
	import MintedReceipt from '$lib/components/receiptdrawer/MintedReceipt.svelte';

	import { selectedEvent } from '$lib/stores/events.js';
	import { selectedAsset } from '$lib/stores/assets.js';
	import { tokenContract } from '$lib/stores/tokencontract.js';

	export let hidden = true;

	// state
	let receipt = writable(undefined);
	let worldRoot = undefined;
	let gettingReceipt = false;
	let savingReceipt = false;
	let mintingReceipt = false;
	let eventDescription = undefined;

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
			<EventDescription event={$selectedEvent} bind:description={eventDescription} />
		</div>
	</div>

	<div
		class="mb-3 p-2 rounded-md dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-400 leading-tight"
	>
		{$selectedEvent?.identity}
	</div>
	{#if !$receipt?.base64}
		<ReceiptGetter {receipt} bind:worldRoot bind:getting={gettingReceipt}/>
	{:else if !$receipt?.isSaved()}
		<!-- TODO: XXX warning about the consequence, and also use case, for
    publicly sharing the proofs of a restricted event.  Ie, this is feature
    where a customer can *chose* on a per event basis to share an event
    publicly and in an independently verifiable way. -->
		<ReceiptSaver {receipt} bind:saving={savingReceipt} />
	{:else if !$receipt?.isMinted() && $tokenContract}
		<ReceiptMinter
			{eventDescription}
			{worldRoot} {receipt}
			bind:minting={mintingReceipt} />
	{:else if !$tokenContract}
		<div
			class="mb-3 p-2 rounded-md dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight"
		>
			<p>
				To save your receipt permanently on a public blockchain (testnet), connect a wallet using
				the "Connect Wallet" button on the main navigation. If you don't have one, just create one
				using your normal social login using the magic of web3auth
			</p>
		</div>
	{/if}
	{#if gettingReceipt || savingReceipt || mintingReceipt}
		<div class="mb-3 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight">
			<p>
				{gettingReceipt ? 'fetching receipt' : savingReceipt ? 'saving receipt' : 'minting receipt'}
			</p>
			<Spinner />
		</div>
	{/if}
	<ReceiptView
		{$receipt}
		{worldRoot}
	/>
	<MintedReceipt/>
</Drawer>
