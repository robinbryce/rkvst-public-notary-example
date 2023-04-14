<script>
	import { MenuButton } from 'flowbite-svelte';
	export let name;
	export let value;
	let revealed = false;
</script>

<div>
	<div class="flex">
		<p class="break-words">{name}</p>
		{#each value as item}
			<MenuButton
				class="dots-menu dark:text-white"
				on:click={() => {
					revealed = !revealed;
				}}
				pill={true}
				outline={true}
				size="xs">Items</MenuButton
			>
			{#if revealed}
				<div>
					<p class="code">{JSON.stringify(item, null, '  ')}</p>
				</div>
			{/if}
		{/each}
	</div>
</div>
