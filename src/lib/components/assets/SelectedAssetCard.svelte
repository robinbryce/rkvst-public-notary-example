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
  </Card>
  <Toggle bind:checked={vCard} class="mt-4 italic dark:text-gray-500">Reverse</Toggle>
</div>

<script>
  import Prism from 'prismjs';

  import { Card, Toggle } from "flowbite-svelte";
  import { AccordionItem, Accordion } from 'flowbite-svelte';
  import { Popover } from "flowbite-svelte";

  import AttributeString from '$lib/components/attributes/AttributeString.svelte';
  import AttributeList from '$lib/components/attributes/AttributeList.svelte';

  export let asset;
  let vCard = true;

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
    image = asset?.attributes?.token_collection_image ?? defaultImage 
  }
</script>

<style>
  .code {
    white-space: pre-wrap;
  }
</style>

