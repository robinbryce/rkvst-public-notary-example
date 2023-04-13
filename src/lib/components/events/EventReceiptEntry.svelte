<Card size="xl">
  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"></h5>
  <div class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">
    <div>
      <p class="font-bold">{description}</p>
      {#if date}
      <p class="indent-1">The event was committed to the ledger on <span class="font-bold">{date}</span></p>
      <p>by <span class="font-bold">{event.principal_accepted.email ?? event.from}</span></p>
      <Hr/>
      {/if}
    </div>
    <div>
      <p class="font-bold">event attributes</p>
      <div class="indent-1">
      {#each eventAttributes as [name, value]}
      {#if value?.constructor?.name === 'String'}
        <AttributeString {name} {value}/>
      {:else if value?.constructor?.name === 'Array'}
        <AttributeList {name} {value}/>
      {:else}
        <AttributeString {name} value={"structured value"}/>
      {/if}
      {/each}
      </div>
    </div>
    <div>
      <Hr/>
      <p class="font-bold">asset attributes</p>
      <div class="indent-1">
      {#each assetAttributes as [name, value]}
      {#if value?.constructor?.name === 'String'}
        <AttributeString {name} {value}/>
      {:else if value?.constructor?.name === 'Array'}
        <AttributeList {name} {value}/>
      {:else}
        <AttributeString {name} value={"structured value"}/>
      {/if}
      {/each}
      </div>
    </div>

    <div>
      <Hr/>
      <Toggle bind:checked={revealRawEventAttributes} class="mt-4 italic dark:text-gray-500">Raw Event Attributes</Toggle>
      <Toggle bind:checked={revealRawAssetAttributes} class="mt-4 italic dark:text-gray-500">Raw Asset Attributes</Toggle>
      {#if revealRawEventAttributes}
        <Hr/>
        <div class="code">
          {JSON.stringify(event?.event_attributes ?? {}, null, '  ')}
        </div>
      {/if}
      {#if revealRawAssetAttributes}
        <Hr/>
        <div class="code">
          {JSON.stringify(event?.asset_attributes ?? {}, null, '  ')}
        </div>
      {/if}

    </div>
  </div>
  <Button class="w-fit" on:click={() => (receiptDrawerHidden = !receiptDrawerHidden)}>
    Receipt <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
  </Button>
</Card>
<script>
  import { Hr, Toggle } from 'flowbite-svelte';
  import { Card, Button } from "flowbite-svelte";

  import AttributeString from '$lib/components/attributes/AttributeString.svelte';
  import AttributeList from '$lib/components/attributes/AttributeList.svelte';

  export let event;
  export let receiptDrawerHidden = true; // this should be bound in the page

  // derived state
  let date = event?.timestamp_committed ?? false;
  if (date) date = new Date(date);
  let operation = event?.operation;
  let behaviour = event?.behaviour;
  let eventType = event?.event_attributes?.arc_display_type;

  let description = eventType ?? `${behaviour}:${operation}`

  let eventAttributes = Object.entries(event?.event_attributes ?? []);
  let assetAttributes = Object.entries(event?.asset_attributes ?? []);

  // dynamic state
  let revealRawEventAttributes = false;
  let revealRawAssetAttributes = false;

</script>
