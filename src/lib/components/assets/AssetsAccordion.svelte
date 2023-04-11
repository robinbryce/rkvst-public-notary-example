<Accordion>
  <AccordionItem>
    <span slot="header">Public Assets (Available: {publicAssets?.length ?? 0})</span>
    <AssetsTable assets={publicAssets} viewName="the public assets view"/>
  </AccordionItem>
  <AccordionItem>
    <span slot="header">Assets (Available: {assets?.length ?? 0})</span>
    <AssetsTable assets={assets} viewName="for the restricted assets view"/>
  </AccordionItem>
</Accordion>
<script>
  import { AccordionItem, Accordion } from 'flowbite-svelte';
  import AssetsTable from '$components/assets/AssetsTable.svelte';
  export let publicAssets;
  export let assets;
</script>