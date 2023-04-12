<div>
  <Card class="min-w-[25%]" img="{image}" reverse={vCard} size="md">
    <h5 id="pop1" class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
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
    <Accordion>
      <AccordionItem open>
        <span slot="header">Details</span>
        {#each attributes as [name, value]}
        {#if value?.constructor?.name === 'String'}
          <AttributeString {name} {value}/>
        {:else if value?.constructor?.name === 'Array'}
          <AttributeList {name} {value}/>
        {:else}
          <AttributeString {name} value={"structured value"}/>
        {/if}
        {/each}
      </AccordionItem>
      <AccordionItem>
        <span slot="header">Raw Attributes</span>
        <div class="code">
          {@html Prism.highlight(JSON.stringify(asset, null, '  '), Prism.languages["javascript"])}
        </div>
      </AccordionItem>
    </Accordion>
    {/if}

    {#if false}
    <Button>
      Read more <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    </Button>
    {/if}
  </Card>
  <Toggle bind:checked={vCard} class="mt-4 italic dark:text-gray-500">Reverse</Toggle>
</div>

<script>
  import Prism from 'prismjs';

  import { Card, Button, Toggle } from "flowbite-svelte";
  import { AccordionItem, Accordion } from 'flowbite-svelte';
  import { Popover } from "flowbite-svelte";

  import AttributeString from '$lib/components/assets/AttributeString.svelte';
  import AttributeList from '$lib/components/assets/AttributeList.svelte';

  export let asset;
  let vCard = false;

  // Defaults.
  let unnamedAssetTitle = "Asset (un named)";
  let pleaseSelectAsset = "Please select an asset";
  let defaultDescription = "There is no description for this asset";
  let defaultImage = "https://nftstorage.link/ipfs/bafybeia7mydteutimc7j7urkk3vnjo2ndkrvoujijbth2kgzuffa6wznjm/game-icon.png";
  let image = defaultImage;

  let title = pleaseSelectAsset;
  let description = defaultDescription;
  let attributes = [];

  $: {
    title = asset ? asset?.attributes.arc_display_name ?? unnamedAssetTitle : pleaseSelectAsset;
    description = asset?.attributes.arc_description ?? defaultDescription;
    attributes = Object.entries(asset?.attributes ?? {});
  }
</script>

<style>
  .code {
    white-space: pre-wrap;
  }
</style>

