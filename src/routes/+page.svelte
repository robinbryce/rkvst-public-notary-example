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
    <NavLi href="/" active={true}>Home</NavLi>
    <NavLi href="{RKVST_URL}" target="_blank">The RKVST</NavLi>
  </NavUl>
</Navbar>
<AssetsAccordion publicAssets={data.public_assets} assets={data.assets}/>

<script>
  import * as env from '$env/static/public';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
  import AssetsAccordion from '$components/assets/AssetsAccordion.svelte';

  export let data; // layout.server.js loads this

  const RKVST_URL=env['PUBLIC_RKVST_URL'];
  const refreshInterval = env['PUBLIC_RKVST_IO_REFRESH_DEFAULT'] ?? 12000;

  // invalidate only makse sense from the client end
  onMount(() => {
    setInterval(async () => {
      invalidate('app:assets')
    }, refreshInterval);
  })

</script>