<Button outline><Chevron>Connect Wallet</Chevron></Button>
<Dropdown bind:open={dropdownOpen}>
  <div slot="header" class="px-4 py-2">
    {#if chainswitch.isLoggedIn()}
    {#if chainswitch.currentUserInfo}
    <span class="block text-sm text-gray-900 dark:text-white">{chainswitch.currentUserInfo?.name ?? "name unknown"}</span>
    <span class="block truncate text-sm font-medium">{chainswitch.currentUserInfo?.email ?? "email unknown"}</span>
    {/if}
    {:else}
    <span class="block text-sm text-gray-900 dark:text-white"> Not logged in </span>
    {/if}
  </div>
  {#if contexts.length > 0}
  {#each contexts as ctx}
  <DropdownItem on:click={()=>{chainswitch.select(ctx.cfg.name); dropdownOpen = false}}>{ctx.cfg.name}</DropdownItem>
  {/each}
  <DropdownItem slot="footer" on:click={()=>{chainswitch.logout(); dropdownOpen = false}}>Sign out</DropdownItem>
  {:else}
  <DropdownItem>No networks available</DropdownItem>
  {/if}
</Dropdown>
<style>
</style>

<script>
import { Button, Dropdown, DropdownItem, DropdownDivider, DropdownHeader, Chevron } from 'flowbite-svelte'

export let chainswitch;
let contexts = [];
let dropdownOpen = false;

$: contexts = chainswitch.contexts();

</script>