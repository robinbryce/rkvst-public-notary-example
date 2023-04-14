<!--
<Toggle bind:checked={vCard} class="mt-4 italic dark:text-gray-500">Reverse</Toggle>
-->

<script>
	import { Card } from 'flowbite-svelte';
	import { Popover } from 'flowbite-svelte';
	import EventReceiptEntry from '$lib/components/events/EventReceiptEntry.svelte';

	import { listEvents } from '$lib/rkvstapi/listevents.js';
	export let asset;
	export let receiptDrawerHidden = true; // bind this, it is shared witha ll event buttons
	let events = [];

	// Defaults.
	let unnamedAssetTitle = 'Events for selected asset';
	let pleaseSelectAsset = 'Please select an asset';
	let defaultDescription = 'There is no description for this asset';
	let defaultImage =
		'https://nftstorage.link/ipfs/bafybeia7mydteutimc7j7urkk3vnjo2ndkrvoujijbth2kgzuffa6wznjm/game-icon.png';

	let title = pleaseSelectAsset;
	let assetName = undefined;
	let data;
	let loading = false;

	$: {
		assetName = asset?.attributes.arc_display_name;
		title = asset ? `Events for ${assetName}` ?? unnamedAssetTitle : pleaseSelectAsset;

		if (asset && !loading) {
			loading = true;
			try {
				console.log(`LOADING ${asset.identity}`);
				load(asset);
			} catch (err) {
				console.log(`ERROR: ${err}`);
			}
			loading = false;
		}
	}

	async function load(asset) {
		data = await listEvents(asset.identity, asset.public, 5);
		events = data?.events ?? [];
		// console.log(JSON.stringify(data, null, '  '));
	}
</script>

<Card size="lg">
	<h5 id="pop1" class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
		{title}
	</h5>
	{#if asset}
		<Popover class="w-96 text-sm font-light " triggeredBy="#pop1">
			{asset.identity}/events
		</Popover>
	{/if}

	<p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">
		{#if !asset}
			Please select an asset
		{/if}
	</p>
	{#if events.length}
		<p class="w-full">The asset has {events.length} events</p>
		{#each events as event}
			<EventReceiptEntry {event} bind:receiptDrawerHidden />
		{/each}
	{:else}
		<p>No events available for asset</p>
	{/if}
</Card>

<style>
	.code {
		white-space: pre-wrap;
	}
</style>
