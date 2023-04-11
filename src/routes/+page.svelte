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

<script>
  import * as env from '$env/static/public';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte'
  const RKVST_URL=env['PUBLIC_RKVST_URL'];
</script>