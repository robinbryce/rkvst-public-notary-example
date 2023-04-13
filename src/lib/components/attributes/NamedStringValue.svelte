{#if popover}
<p class="{class_}" id="name1">{name}</p>
<Popover class="w-96 text-sm font-light " triggeredBy="#name1">
  {value}
</Popover>
{:else}
  <Button on:click={() => {revealed = !revealed}} pill={true} outline={true} size='xs'>
    {name}
  </Button>
  {#if revealed}
  <p>{value}</p>
  {/if}
{/if}
<script>
  import { Button, Popover } from 'flowbite-svelte';
  export let name;
  export let value;
  export let popover = true;
  export let revealed = false; // ignored if popover is false
  let class_=`break-words${popover ? " underline": ""}`
</script>
