<Drawer placement='right' width='w-1/3' {backdrop} transitionType="fly" {transitionParams} bind:hidden={hidden} id='sidebar11'>
<div class="flex text-center">
  <div class="flex mb-4 mr-4 -space-x-4">
     <img class="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800" src="{image}" alt="">
  </div>

  <h5
    id="drawer-label"
    class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
    <p class="mr-3">Get a receipt</p>
  </h5>

  <CloseButton on:click={() => (hidden = true)} class='mb-4 dark:text-white'/>

</div>
  <br/>
  <div class="mb-3 rounded-md border-dotted border-2 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight">
    <div class="m-3">
    <EventDescription event={$selectedEvent} />
    </div>
  </div>

   <form action="#" class="mb-6">
    <div class="mb-6">
      <Label for='title' class='block mb-2'>Event identity</Label>
      <Input id='title' name='title' disabled value="{$selectedEvent?.identity}" />
    </div>
    <Button type="submit" class="w-full">Get Receipt</Button>
   </form>
</Drawer>

<script>
  import { Drawer, CloseButton } from 'flowbite-svelte';
  import { Button, Input, Label} from 'flowbite-svelte';
  import { sineIn } from 'svelte/easing';

  import EventDescription from '$lib/components/events/EventDescription.svelte';

  import { selectedEvent } from '$lib/stores/events.js';
  import { selectedAsset } from '$lib/stores/assets.js';

  export let hidden = true; 
  let defaultImage = "https://nftstorage.link/ipfs/bafybeia7mydteutimc7j7urkk3vnjo2ndkrvoujijbth2kgzuffa6wznjm/game-icon.png";
  let image = $selectedEvent?.event_attributes?.token_image;
  if (!image)
    image = $selectedAsset?.attributes?.token_collection_image;
  image = image ?? defaultImage;

  // let activateClickOutside = false
  let backdrop = false
  let transitionParams = {
    x: 320,
    duration: 200,
    easing: sineIn
  };
</script>
