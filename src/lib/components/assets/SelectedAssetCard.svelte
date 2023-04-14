<script>
	import { Card, Toggle } from 'flowbite-svelte';
	import { Popover } from 'flowbite-svelte';

	import AttributeString from '$lib/components/attributes/AttributeString.svelte';
	import AttributeList from '$lib/components/attributes/AttributeList.svelte';
	import NamedStringValue from '$lib/components/attributes/NamedStringValue.svelte';

	export let asset;

	// Defaults.
	let unnamedAssetTitle = 'Asset (un named)';
	let pleaseSelectAsset = 'Please select an asset';
	let defaultDescription = 'There is no description for this asset';
	let defaultImage =
		'https://nftstorage.link/ipfs/bafybeia7mydteutimc7j7urkk3vnjo2ndkrvoujijbth2kgzuffa6wznjm/game-icon.png';

	let revealRawAttributes = false;
	let image = defaultImage;
	let title = pleaseSelectAsset;
	let description = defaultDescription;
	let attributes = [];

	$: {
		title = asset ? asset?.attributes.arc_display_name ?? unnamedAssetTitle : pleaseSelectAsset;
		description = asset?.attributes.arc_description ?? defaultDescription;
		attributes = Object.entries(asset?.attributes ?? {});
		image = asset?.attributes?.token_collection_image ?? defaultImage;
	}
</script>

<div>
	<Card class="min-w-[25%]" img={image} reverse={true} size="md">
		<h5 id="pop1" class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
			{title}
		</h5>
		{#if asset}
			<Popover class="w-96 text-sm font-light " triggeredBy="#pop1">
				{asset.identity}
			</Popover>
		{/if}

		<p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">
			{#if asset}
				{description}
			{:else}
				Please select an asset
			{/if}
		</p>
		{#if asset}
			{#each attributes as [name, value]}
				{#if value?.constructor?.name === 'String'}
					<NamedStringValue {name} {value} popover={false} />
				{:else if value?.constructor?.name === 'Array'}
					<AttributeList {name} {value} />
				{:else}
					<AttributeString {name} value={'structured value'} />
				{/if}
			{/each}
			<Toggle bind:checked={revealRawAttributes} class="mt-4 italic dark:text-gray-500"
				>Raw Attributes</Toggle
			>

			{#if revealRawAttributes}
				<div class="code">
					{JSON.stringify(asset, null, '  ')}
				</div>
			{/if}
		{/if}
	</Card>
</div>

<style>
	.code {
		white-space: pre-wrap;
	}
</style>
