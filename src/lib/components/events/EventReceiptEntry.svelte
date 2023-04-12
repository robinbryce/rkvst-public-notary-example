<Card size="xl">
  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"></h5>
  <div class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">
    <div>{description} </div>
    <div>
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
    <div>
      <MenuButton class="dots-menu dark:text-white">Raw Attributes</MenuButton>
      <Dropdown triggeredBy=".dots-menu" class="w-48 overflow-y-auto py-1 h-48">
        <DropdownItem class="items-center text-base gap-2">
          <!-- just use prism for now-->
          <div class="code">
            {@html Prism.highlight(JSON.stringify(event?.event_attributes ?? {}, null, '  '), Prism.languages["javascript"])}
          </div>
        </DropdownItem>
      </Dropdown>
    </div>
  </div>
  <Button class="w-fit">
    Receipt <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
  </Button>
</Card>
<script>
  import Prism from 'prismjs';
  import { MenuButton, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { Card, Button } from "flowbite-svelte";

  import AttributeString from '$lib/components/attributes/AttributeString.svelte';
  import AttributeList from '$lib/components/attributes/AttributeList.svelte';

  export let event;

  let date = event?.timestamp_committed ?? "(not available)";
  let operation = event?.operation;
  let behaviour = event?.behaviour;
  let eventType = event?.event_attributes?.arc_display_type;


  let description = eventType ?? `${behaviour}:${operation}`

  let ignoreAttributes = {
    arc_display_type: true
  }

  let eventAttributes = Object.entries(event?.event_attributes ?? []);
  let assetAttributes = Object.entries(event?.asset_attributes ?? []);
</script>
