<script>
  import { ethers } from 'ethers';

  import { readable } from 'svelte/store';
	import { Listgroup, ListgroupItem } from 'flowbite-svelte';
	import { A, Img } from 'flowbite-svelte';
	import CopyIconLink from '$lib/components/utility/CopyIconLink.svelte';
	const mountClass =
		'mb-6 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight';

  import { ReceiptMetadata } from '$lib/receipt.js';
  import { matchLastReceipt, createTokenMSBMatcher, receiptLogBySignature } from '$lib/web3/matchevents.js';
  import { ipfsGatewayURL } from '$lib/web3/ipfsfetch.js';

  import { receiptTokenID, receiptHexUUID } from '$lib/rkvstapi/identity.js';
  import { parseEventLog } from '$lib/web3/eventhandler.js';
  import * as erc1155 from '$lib/web3/erc1155.js';

	import { selectedEvent } from '$lib/stores/events.js';
	import { firstMatchingReceipt } from '$lib/stores/web3/firstmatchingreceipt.js';
  import { chainSwitch } from '$lib/stores/chainswitch.js';
	import { tokenContract } from '$lib/stores/tokencontract.js';
	import { signerAddress } from '$lib/stores/signeraddress.js';

  const log = console;

  let receiptTokenTransfer;
  let mintedReceipt = undefined;
  let openseaAssetsURL = undefined;
  let rkvstEventTokensAddress = undefined;
  let openseaTokenURL = undefined;

  $: {
    openseaAssetsURL = $chainSwitch?.getCurrent()?.cfg?.openseaAssetsURL;
    rkvstEventTokensAddress = $chainSwitch?.getCurrent()?.cfg?.rkvstEventTokensAddress;
    if (mintedReceipt)
      openseaTokenURL = openseaAssetsURL + rkvstEventTokensAddress + '/' + mintedReceipt?.tokenId?.toString()
  }

  // Note: signerAddress is always set *immediately after* the new contract
  // instance is bound. So by reacting to signerAddress only, we are sure the
  // tokenContract is in sync before we get the notification.
  // $: receiptTokenTransfer = firstReceiptStore($signerAddress, $selectedEvent);
  $: receiptTokenTransfer = lastReceiptStore($signerAddress, $selectedEvent);

  function lastReceiptStore($signerAddress, $selectedEvent) {
    if (!$signerAddress || !$tokenContract || !selectedEvent) {
      log.info(`MintedReceipt# firstReceiptStore tokenContract and selectedEvent not available yet`);
      return;
    }
    log.info(`MintedReceipt# start store`);

    const matchTarget = receiptHexUUID($selectedEvent);
    const matcher = createTokenMSBMatcher(matchTarget);

    const store = readable(undefined, function start(set){
      log.info(`MintedReceipt# start store!!`);
      (async () => {
        const match = await matchLastReceipt(
          matcher, $tokenContract,
          erc1155.TransferSingleSignature, null, ethers.constants.AddressZero, $signerAddress);

        set(match);
      })();

      return () => {log.info(`xxxxxxxx xxxxxxxxxxxxxx xxxxxxxx`)}
    });

    store.subscribe(async (value) => {
      if (!value) return;

      const {receipt} = value;

      const uriEvent = receiptLogBySignature(receipt, erc1155.URISignature, $tokenContract);

      console.log(`${JSON.stringify(uriEvent.args)}`);
      const [metadataURI, tokenId] = uriEvent.args;
      mintedReceipt = await ReceiptMetadata.fromTokenURI(tokenId, metadataURI);
    });

    return store;
  }


</script>
<div class="{mountClass}">
  <Listgroup active class="w-full">
    {#if mintedReceipt}
    {#if {openseaTokenURL}}
  	<ListgroupItem class="text-base font-semibold gap-2">
      <A href={openseaTokenURL} target="_blank">OpenSea NFT</A>
  	</ListgroupItem>
    {/if}
  	<ListgroupItem class="text-base font-semibold gap-2">
      {mintedReceipt?.tokenId?.toHexString()}
  		<CopyIconLink getText={() => mintedReceipt?.tokenId?.toHexString()} />
  	</ListgroupItem>
  	<ListgroupItem class="text-base font-semibold gap-2">
      {mintedReceipt?.tokenId?.toString()}
  		<CopyIconLink getText={() => mintedReceipt?.tokenId?.toString()} />
  	</ListgroupItem>

  	<ListgroupItem class="text-base font-semibold gap-2">
      <A href={mintedReceipt.gatewayURI} target="_blank">metadata.json</A>
  	</ListgroupItem>
  	<ListgroupItem class="text-base font-semibold gap-2">
      <A href={ipfsGatewayURL(mintedReceipt.receipt.ipfs.receipt_url)} target="_blank">receipt.b64.txt</A>
  	</ListgroupItem>
  	<ListgroupItem class="text-base font-semibold gap-2">
      <A href={ipfsGatewayURL(mintedReceipt.receipt.ipfs.receipt_content_url)} target="_blank">receipt-content.json</A>
  	</ListgroupItem>

    {#if mintedReceipt.image}
  	<ListgroupItem class="text-base font-semibold gap-2">
      <Img src="{mintedReceipt.image}" alt="token image" size="max-w-xs" class="rounded-lg" />
  	</ListgroupItem>
    {/if}
    {:else}
  	<ListgroupItem class="text-base font-semibold gap-2">
      token not found yet
  	</ListgroupItem>
    {/if}
  </Listgroup>
</div>
