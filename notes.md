- following this guide https://flowbite.com/docs/getting-started/svelte/
  but install the deps as --save-dev
- the starter for svelte installed typescrypt 5 but the tailwindcss starter installs svelte-preprocess 4. re-installing svelte-preprocess@latest fixed this
- ethers 5.x on server side isn't happy when the svelte application is type:module
- use vite-plugin-node-polyfills to make node core modules available client side, this solves all the nasty globals patching required to import web3auth/modal

- use a custom app reg claim to set the assets of interest
- Temporary policy: ChatGPT is banned - Meta Stack Overflow
- https://meta.stackoverflow.com/questions/421831/temporary-policy-chatgpt-is-banned?cb=1

## how to create an app reg with custom claims

num assets
asset_0
assets_filter
