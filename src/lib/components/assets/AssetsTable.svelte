{#if assets.length}
<Table>
  <TableHead>
    <TableHeadCell>ID</TableHeadCell>
    <TableHeadCell>Asset Name</TableHeadCell>
    <TableHeadCell>Asset Type</TableHeadCell>
  </TableHead>
  <TableBody class="divide-y">
    {#each assets as asset, i (asset.identity)}
    <TableBodyRow>
      <TableBodyCell>{asset.identity}</TableBodyCell>
      <TableBodyCell>{asset.attributes?.arc_display_name}</TableBodyCell>
      <TableBodyCell>{asset.attributes?.arc_display_type}</TableBodyCell>
    </TableBodyRow>
    {/each}
  </TableBody>
</Table>
{:else}
<p>no assets to show for {viewName}</p>
{/if}

<script>
  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
  export let viewName;
  export let assets;
</script>
