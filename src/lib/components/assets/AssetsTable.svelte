<script>
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { Button, Popover } from 'flowbite-svelte';
	import { selectedAsset } from '$lib/stores/assets.js';
	import { identityAbbrev } from '$lib/rkvstapi/identity.js';
	export let viewName;
	export let assets;
	export let showId = true;
</script>

{#if assets.length}
	<Table>
		<TableHead>
			<TableHeadCell>Asset Name</TableHeadCell>
			{#if showId}
				<TableHeadCell>ID</TableHeadCell>
			{/if}
			<TableHeadCell>Asset Type</TableHeadCell>
		</TableHead>
		<TableBody class="divide-y">
			{#each assets as asset, i (asset.identity)}
				<TableBodyRow>
					<TableBodyCell>
						<Button on:click={() => ($selectedAsset = { ...asset })}
							>{asset.attributes?.arc_display_name}</Button
						>
					</TableBodyCell>
					{#if showId}
						<TableBodyCell>
							<Button id="b1" outline={true} disabled>{identityAbbrev(asset.identity)}</Button>
							<Popover class="w-96 text-sm font-light " triggeredBy="#b1">
								{asset.identity}
							</Popover>
						</TableBodyCell>
					{/if}
					<TableBodyCell>{asset.attributes?.arc_display_type}</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{:else}
	<p>no assets to show for {viewName}</p>
{/if}
