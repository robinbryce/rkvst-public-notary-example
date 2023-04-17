<script>
	export let event;
	// derived state
	let date = event?.timestamp_committed ?? false;
	if (date) date = new Date(date);
	let operation = event?.operation;
	let behaviour = event?.behaviour;
	let eventType = event?.event_attributes?.arc_display_type;
	let who = event.principal_accepted.email ?? event.from;

	export let description = eventType ?? `${behaviour}:${operation}`;
</script>

<div>
	{#if event}
		<p class="font-bold">{description}</p>
		<p class="indent-1">The event was committed to the ledger on {date}</p>
		{#if who}
			<p>by <span class="font-bold">{who}</span></p>
		{/if}
	{:else}
		<p>event not available</p>
	{/if}
</div>
