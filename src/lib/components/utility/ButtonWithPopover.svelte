<Button id="{id}" class="{class_}" on:click={async () => await dispatchClick()}
	>{buttonText}</Button
>
<Popover class="w-96 text-sm font-light " triggeredBy="#{id}">
  <slot name="pop">
    {popText}
  </slot>
</Popover>

<script>
	import { Button, Popover } from 'flowbite-svelte';
  import { awaitable } from '$lib/idioms.js';

  export let id;
  export let handleClick;
  export let class_ = "w-full mb-2"
  export let buttonText;
  export let popText; // if the popover is just text use this otherwise use slot

  async function dispatchClick() {
    if (awaitable(handleClick))  {
      await handleClick();
      return;
    }
    handleClick();
  }
</script>
