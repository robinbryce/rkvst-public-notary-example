<Navbar let:hidden let:toggle>
  <NavBrand href="/">
    <img
      src="https://app.rkvst.io/dist/assets/icons/rkvst-32x32.png"
      class="mr-3 h-6 sm:h-9"
      alt="RKVST Logo"
    />
    <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
      API Demo 
    </span>
  </NavBrand>
  <NavHamburger on:click={toggle} />
  <NavUl {hidden}>
    <NavLi>
      <div class="text-center">
        <Button on:click={() => (assetsDrawerHidden = !assetsDrawerHidden)}>{drawerButtonText}</Button>
      </div>
    </NavLi>
    <NavLi href="/" active={true}>Home</NavLi>
    <NavLi href="{RKVST_URL}" target="_blank">The RKVST</NavLi>
  </NavUl>
</Navbar>

<AssetsDrawer publicAssets={data.public_assets} assets={data.assets} bind:hidden={assetsDrawerHidden}/>
<ReceiptDrawer bind:hidden={receiptDrawerHidden}/>
<div class="flex justify-center gap-4 pt-10 w-full">
  <div><SelectedAssetCard asset={$selectedAsset}/></div>
  <!-- ... -->
  <div class="w-1/4"><SelectedEventsCard asset={$selectedAsset} events={[]} bind:receiptDrawerHidden={receiptDrawerHidden}/></div>
</div>
<script>
  import * as env from '$env/static/public';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
  import { Button } from 'flowbite-svelte';
  import AssetsDrawer from '$components/assets/AssetsDrawer.svelte';
  import ReceiptDrawer from '$lib/components/events/ReceiptDrawer.svelte';
  import SelectedAssetCard from '$components/assets/SelectedAssetCard.svelte';
  import SelectedEventsCard from '$components/events/SelectedEventsCard.svelte';

  import { selectedAsset } from '$lib/stores/assets.js';

  const RKVST_URL=env['PUBLIC_RKVST_URL'];
  const refreshInterval = env['PUBLIC_RKVST_IO_REFRESH_DEFAULT'] ?? 12000;

  export let data; // layout.server.js loads this

  let assetsDrawerHidden = true;
  let receiptDrawerHidden = true;
  let drawerButtonText = "Select Asset"
  let selectedAssetName;
  let selectedIdentity;

  $: {
    if ($selectedAsset) {
      selectedAssetName = $selectedAsset.attributes?.arc_display_name;
      selectedIdentity = $selectedAsset.identity;
      drawerButtonText = `Change Asset (${selectedAssetName})`;
    } else {
      drawerButtonText = "Select Asset";
    }
  }


  // invalidate only makse sense from the client end
  onMount(() => {
    setInterval(async () => {
      invalidate('app:assets')
    }, refreshInterval);
  })

</script>