<script>
	import { DocumentDuplicate } from 'svelte-heros-v2';
	import { createEventDispatcher } from 'svelte';

	export let getText;
	export let size = 16;

	const dispatch = createEventDispatcher();
	const copy = (text) => {
		navigator.clipboard.writeText(text).then(
			() => dispatch('copy', text),
			(e) => dispatch('fail')
		);
	};
</script>

<a class="underline" id="copy-anchor" href="#copy" on:click={copy(getText())}>
	<DocumentDuplicate variation="outline" {size} /></a
>
