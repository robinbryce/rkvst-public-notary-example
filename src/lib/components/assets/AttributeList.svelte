<div class="grid gap-4 grid-cols-2">
  <div>
    <p>{name}</p>
  </div>
  <div>
    {#if value?.length}
    <Button><Chevron>Items</Chevron></Button>
    <Dropdown class="w-48 overflow-y-auto py-1 h-48">
    {#each value as item, i}
      <DropdownItem class="flex items-center text-base gap-2">
        <!-- just use prism for now-->
        <div class="code">
          {@html Prism.highlight(JSON.stringify(item, null, '  '), Prism.languages["javascript"])}
        </div>
      </DropdownItem>
    {/each}
    </Dropdown>
    {:else}
    empty list
    {/if}
  </div>
</div>

<script>
  import Prism from 'prismjs';
  import { Button, Dropdown, DropdownItem, Chevron, Avatar } from 'flowbite-svelte'
  export let name;
  export let value;
</script>
<style>
  .code {
    white-space: pre-wrap;
  }
</style>
