# SvelteKit demo: An RKVST platform integration & use of NFT Storage.

## Where can I see it ?

On our favourite svelte hosting provider, vercel at this link [rkvst-public-notary-example.vercel.app](https://rkvst-public-notary-example.vercel.app/)

(Please note this is subject to rate limits)

## What is this demo about ?

For the [Svelte Hackathon](https://hack.sveltesociety.dev/) we thought it would be great to show of how easy it is to build powerful integrations with Svelte Kit, and how the [RKVST Developer API's](https://www.rkvst.com/developers/) slot easily in to any web application. We use [NFT.Storage](https://nft.storage/) as a handy place to keep our receipts for this demo.

This demo show cases an up coming feature on the RKVST platform which enables off line and independently verifiable "proof of posting" for records stored in the RKVST. This is part of our commitment to solving problems with software supply chain integrity. We recently showcased this at an [IETF hackathon](https://www.rkvst.com/press_releases/rkvst-showcases-supply-chain-integrity-transparency-and-trust-implementation-at-ietf-116-hackathon/)

These receipts are verifiable using standard ethereum tools or, if you prefer the convenience, our [open source tool](https://github.com/rkvst/rkvst-receipt-scitt)

But once you have a receipt where do you put it ? In this demo we put it in IPFS

But once you have a receipt where do you put it ? In this demo we put it in IPFS

**NOTICE: the following feature was not available in the vercel demo in time for the hackathon close**

AND, then we mint an NFT. The NFT mint is only allowed if a valid merkle inclusion proof is presented.

For hackathon close we only had saving the receipts to IPFS fully integrated

> This is the PR that fixed the deployment issue: https://github.com/robinbryce/rkvst-public-notary-example/tree/vercel-build-fix-ethers-web3auth



An integration with web3auth enabling you to use your normal social logins to create web3 wallets is provided. To mint you will need to copy the address of your wallet (under the connect button after you connect) and go to the https://mumbaifaucet.com/

Once the token is minted you can see it on open sea if you take the contract address "0xd3bFcaA65144F0f7f4328F4fD7b3f245b3525a74" and search for it on [opensea](https://testnets.opensea.io/collection/unidentified-contract-15322) or the [mumbai explorer](https://mumbai.polygonscan.com/address/0xd3bFcaA65144F0f7f4328F4fD7b3f245b3525a74).

The ERC1155 / ERC2535 contracts were also built for this hackathon. The are in
this repo https://github.com/robinbryce/rkvst-event-tokens

The separate repo makes it easier to manage the web3/solidity dependencies

## What is the RKVST ?

From our [developer docs](https://www.rkvst.com/developers/)

> A blockchain-powered data provenance platform to attach tamper-evident metadata to every record you store. Track, trace, attest and verify your supply chain data for simple, faster governance, audit and compliance.

## What is NFT Storage ?

Its an ipfs pinning and management service oriented towards NFT's. See [nft.storage/about](https://nft.storage/#about)

## How hard was that to build ?

Have a look at the date stamps on the [commit history](https://github.com/robinbryce/rkvst-public-notary-example/commits/main) - another great use for a merkle tree ;-)

## Ok, tell me how SvelteKit and the RKVST work together.

### Getting access - App registration and app registration custom claims

This demo works without signing up to the RKVST. It manages this because it is given access to selected records in the tenancy of an existing RKVST customer (who is also the developer of this demo). Access is granted using access tokens obtained by creating an [RKVST App Registration](https://docs.rkvst.com/docs/rkvst-basics/getting-access-tokens-using-app-registrations/)

The code for getting the access token can be seen in [routes/api/rkvst/io/authorize.js](./src/routes/api/rkvst/io/authorize.js). To avoid revealing this token to the browser client we use SvelteKit [server routes](https://kit.svelte.dev/docs/routing#server) and the adapter for our provider of choice [adapter-vercel](https://kit.svelte.dev/docs/adapter-vercel) to access the client id and secret for the RKVST app registration.

When the app registration is created, additional [token claims](https://openid.net/specs/openid-connect-core-1_0.html#Claims) are configured. When the svelte app obtains its access token, those claims - identifying the RKVST assets of interest - are included on the token returned to the server side route.

The claims identify the [RKVST Assets](https://docs.rkvst.com/docs/overview/core-concepts/#assets) the tenant owner is making available to the app. This is just one way in which evidence on the RKVST can be made available outside of the customers tenant. See [access policies](https://docs.rkvst.com/docs/overview/core-concepts/#access-policies) for the full range of evidence sharing capabilities.

### Getting RKVST evidence - assets and events API

To make for a seamless integration, this demo implements a generic proxy for the rkvst api. The proxy code is in [routes/api/rkvst/io/proxy.js](./src/routes/api/rkvst/io/proxy.js) and the server endpoint is in [+server.js](./src/routes/api/rkvst/io/[...path]/+server.js). Note that we make use of Svelte's [rest](https://kit.svelte.dev/docs/advanced-routing#rest-parameters) route feature to capture the arbitrary route into the RKVST api.

This makes it natural and simple to implement a browser client side function to list RKVST events. See the code at [lib/rkvstapi/listevent.js](./src/lib/rkvstapi/listevents.js) and its use

We use a load method in the application wide [layout](https://kit.svelte.dev/docs/routing#layout-layout-js) to run our `listEvents` function. We then use the SvelteKit [invalidate](https://kit.svelte.dev/docs/modules#$app-navigation-invalidate) method to cause load method to re-run at regular intervals. This will pick up changes in the assets over time.

### Getting off line verifiable receipts - Notary (beta) API

Note, this api is beta and only available for customers on the paid tier today. The demo uses a tenancy that has this enabled. Free version following soon.

With the proxy route already implemented, we only had to write a client side helper and implement the Svelte component.

The helper for fetching the receipt and obtaining the decodings can be seen at [lib/rkvstapi/getreceipt.js](./src/lib/rkvstapi/getreceipt.js). The component implementing the loading can be seen at [components/events/ReceiptDrawer.svelte](./src/lib/components/events/ReceiptDrawer.svelte). Note that as this is a beta api it is not resourced as much as other parts of the platform, so we put in a load spinner for this demo.

### Saving receipts to IPFS

Once we have the receipt from the RKVST, we have decided we want to share the receipt with the whole world so we put it in IPFS. This means that RKVST cant ever refute we saved this data on their private blockchain even if they wanted to.

We use the [NFT.Storage/storeDirectory](https://nft.storage/docs/client/js/#storedirectory---store-a-collection-of-files) javascript api to achieve this. We use a server side route again so that the API key for nft storage is not revealed on the client side.

### UX for getting the receipts and displaying the results

The flow for getting a receipt, saving it to IPFS and then providing the user with conveniences to inspect the results is taken care of in the component [ReceiptDrawer.svelte](./src/lib/components/events/ReceiptDrawer.svelte)

## Futher work

We are going to implement the smart contracts necessary to on chain verify the merkle proofs. We will then make an ERC 1155 interface which gates minting tokens based on successful proof verification. To make things convenient for the browser side we take the raw receipt and do the decomposition into the more readable formats on the server side.

See [routes/api/nft-storage/store/receipt/+server.js](./src/routes/api/nft-storage/store/receipt/+server.js)
