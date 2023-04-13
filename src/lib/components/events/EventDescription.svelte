<div>
  {#if event}
  <p class="font-bold">{description}</p>
  <p class="indent-1">The event was committed to the ledger on <span class="font-bold">{date}</span></p>
  <p>by <span class="font-bold">{who}</span></p>
  {:else}
  <p>event not available</p>
  {/if}
</div>

<script>
  export let event;
  // derived state
  let date = event?.timestamp_committed ?? false;
  if (date) date = new Date(date);
  let operation = event?.operation;
  let behaviour = event?.behaviour;
  let eventType = event?.event_attributes?.arc_display_type;
  let who = event.principal_accepted.email ?? event.from;

  let description = eventType ?? `${behaviour}:${operation}`
</script>
