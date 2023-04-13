<Drawer placement='right' width='w-1/3' {backdrop} transitionType="fly" {transitionParams} bind:hidden={hidden} id='sidebar11'>
<div class='flex items-center'>
  <h5
    id="drawer-label"
    class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
    <p>Get a receipt</p>
  </h5>
  <CloseButton on:click={() => (hidden = true)} class='mb-4 dark:text-white'/>
</div>
</Drawer>

<script>
  import { Drawer, CloseButton } from 'flowbite-svelte';
  import { sineIn } from 'svelte/easing';

  export let hidden = true; 

  // let activateClickOutside = false
  let backdrop = false
  let transitionParams = {
    x: 320,
    duration: 200,
    easing: sineIn
  };
</script>
