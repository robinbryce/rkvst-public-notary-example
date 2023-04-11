<div class="text-center">
  <Button id="b1" on:click={() => (hidden10 = false)}>{drawerButtonText}</Button>
  {#if selectedIdentity}
  <Popover class="w-64 text-sm font-light " triggeredBy="#b1">
    {selectedIdentity}
  </Popover>
  {/if}
</div>

<Drawer width='w-1/3' {activateClickOutside} {backdrop} transitionType="fly" {transitionParams} bind:hidden={hidden10} id='sidebar10'>
<div class='flex items-center'>
  <h5
    id="drawer-label"
    class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
    <p>Select an asset</p>
  </h5>
  <CloseButton on:click={() => (hidden10 = true)} class='mb-4 dark:text-white'/>
</div>
  <AssetsAccordion {publicAssets} {assets} showId={false}/>
</Drawer>

<script>
  import { Drawer, Button, CloseButton, Popover } from 'flowbite-svelte';
  import { sineIn } from 'svelte/easing';
  import AssetsAccordion from '$components/assets/AssetsAccordion.svelte';

  import { selectedAsset } from '$lib/stores/assets.js';

  export let publicAssets = [];
  export let assets = [];
  let drawerButtonText = "Select Asset"
  let selectedAssetName;
  let selectedIdentity;

  $: {
    if ($selectedAsset) {
      selectedAssetName = $selectedAsset.attributes?.arc_display_name;
      selectedIdentity = $selectedAsset.identity;
      drawerButtonText = `Change Asset (${selectedAssetName})`;
    } else {
      drawerButtonText = "Select Asset";
    }
  }


  let hidden10 = true; 
  let activateClickOutside = false
  let backdrop = false
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn
  };
</script>
