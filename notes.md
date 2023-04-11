* following this guide https://flowbite.com/docs/getting-started/svelte/
    but install the deps as --save-dev
* the starter for svelte installed typescrypt 5 but the tailwindcss starter installs svelte-preprocess 4. re-installing svelte-preprocess@latest fixed this
* ethers 5.x on server side isn't happy when the svelte application is type:module
* use vite-plugin-node-polyfills to make node core modules available client side, this solves all the nasty globals patching required to import web3auth/modal