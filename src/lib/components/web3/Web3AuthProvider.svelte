<script>
	import { Button, Dropdown, DropdownItem, DropdownDivider, Chevron } from 'flowbite-svelte';
	import CopyIconLink from '$lib/components/utility/CopyIconLink.svelte';
	import { currentUserInfo } from '$lib/stores/web3userinfo.js';

	export let chainswitch;
	let contexts = [];
	let current = undefined;
	let dropdownOpen = false;

	$: refreshMenu(dropdownOpen);

	function refreshMenu(open) {
		if (!open) return;
		contexts = chainswitch.contexts();
		current = chainswitch.getCurrent();
	}
</script>

<Button outline><Chevron>{$currentUserInfo?.name ?? 'Connect Wallet'}</Chevron></Button>
<Dropdown bind:open={dropdownOpen}>
	<div slot="header" class="px-4 py-2">
		{#if $currentUserInfo}
			<span class="block text-sm text-gray-900 dark:text-white">
				{chainswitch.currentUserInfo?.email ?? 'email unknown'}
			</span>
			<span class="block truncate text-sm font-medium" />
			{#if current?.signerAddress}
				<DropdownDivider />
				<span class="block truncate text-sm font-medium">
					{current.signerAddress}
				</span>
				<CopyIconLink getText={() => current.signerAddress} />
			{:else}
				<span class="block truncate text-sm font-medium">address not known</span>
			{/if}
		{:else}
			<span class="block text-sm text-gray-900 dark:text-white">Not logged in </span>
		{/if}
	</div>
	{#if contexts.length > 0}
		{#each contexts as ctx}
			<DropdownItem
				on:click={() => {
					chainswitch.select(ctx.cfg.name);
					dropdownOpen = false;
				}}>{ctx.cfg.name}</DropdownItem
			>
		{/each}
		<DropdownItem
			slot="footer"
			on:click={() => {
				chainswitch.logout();
				dropdownOpen = false;
			}}>Sign out</DropdownItem
		>
	{:else}
		<p>{contexts.length}</p>
		<DropdownItem>No networks available</DropdownItem>
	{/if}
</Dropdown>

<style>
</style>
