<script>
	import { Popover } from 'flowbite-svelte';
	export let name;
	export let value;
	export let imageAttributes = {
		token_collection_image: true
	};
</script>

<div class="grid gap-4 grid-cols-2">
	<div>
		<p>{name}</p>
	</div>
	<div>
		{#if imageAttributes[name]}
			<a
				href={value}
				class="text-blue-600 underline dark:text-blue-500 hover:no-underline"
				id="popover-image">image</a
			>
			<Popover triggeredBy="#popover-image" class="w-96 text-sm font-light" defaultClass="">
				<img src={value} class="col-span-2 h-full rounded-r-lg" alt="image url {name}" />
			</Popover>
		{:else}
			<p>{value}</p>
		{/if}
	</div>
</div>
