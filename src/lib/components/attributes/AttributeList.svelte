<div>
  <div class="flex">
    <div>
        <p class="break-words">{name}</p>
    </div>
    <div>
      <MenuButton class="dots-menu dark:text-white">Items</MenuButton>
      <Dropdown triggeredBy=".dots-menu" class="w-48 overflow-y-auto py-1 h-48">
      {#each value as item, i}
        <DropdownItem class="items-center text-base gap-2">
          <!-- just use prism for now-->
          <div class="code">
            {@html Prism.highlight(JSON.stringify(item, null, '  '), Prism.languages["javascript"])}
          </div>
        </DropdownItem>
      {/each}
      </Dropdown>
    </div>
  </div>
</div>

<script>
  import Prism from 'prismjs';
  import { MenuButton, Dropdown, DropdownItem, Chevron } from 'flowbite-svelte'
  export let name;
  export let value;
</script>
<style>
  .code {
    white-space: pre-wrap;
  }
</style>
