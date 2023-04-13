<Drawer width='w-1/3' {backdrop} transitionType="fly" {transitionParams} bind:hidden={hidden} id='sidebar10'>
<div class='flex items-center'>
  <h5
    id="drawer-label"
    class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
    <p>Select an asset</p>
  </h5>
  <CloseButton on:click={() => (hidden = true)} class='mb-4 dark:text-white'/>
</div>
  <AssetsAccordion {publicAssets} {assets} showId={true}/>
</Drawer>

<script>
  import { Drawer, CloseButton } from 'flowbite-svelte';
  import { sineIn } from 'svelte/easing';
  import AssetsAccordion from '$components/assets/AssetsAccordion.svelte';

  export let hidden = true; 
  export let publicAssets = [];
  export let assets = [];

  // let activateClickOutside = false
  let backdrop = false
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn
  };
</script>
