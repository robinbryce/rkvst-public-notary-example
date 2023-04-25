<script>
  import { ethers } from 'ethers';
	import { Listgroup, ListgroupItem } from 'flowbite-svelte';
	import CopyIconLink from '$lib/components/utility/CopyIconLink.svelte';
	const mountClass =
		'mb-6 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight';

  import { ReceiptMetadata } from '$lib/receipt.js';
	import { selectedEvent } from '$lib/stores/events.js';
	import { firstMatchingReceipt } from '$lib/stores/web3/firstfilteredevent.js';
  import { uuidFromIdentity } from '$lib/rkvstapi/identity.js';
	import { tokenContract } from '$lib/stores/tokencontract.js';
  import { parseEventLog } from '$lib/web3/eventhandler.js';
	import { signerAddress } from '$lib/stores/signeraddress.js';

  const log = console;

  let receiptTokenTransfer;
  let mintedReceipt = undefined;

  // Note: signerAddress is always set *immediately after* the new contract
  // instance is bound. So by reacting to signerAddress only, we are sure the
  // tokenContract is in sync before we get the notification.
  $: receiptTokenTransfer = firstReceiptStore($signerAddress, $selectedEvent);

  function firstReceiptStore($signerAddress, selectedEvent) {
    if (!$signerAddress || !$tokenContract || !selectedEvent) {
      log.info(`MintedReceipt# firstReceiptStore tokenContract and selectedEvent not available yet`);
      return;
    }
	  const signature = 'TransferSingle(address,address,address,uint256,uint256)';

    // 0x92a1c7b553f2446d9661e2754802ba3800000000000000000000000000000001

    log.debug(`MintedReceipt# firstReceiptStore selectedEvent.identity ${selectedEvent.identity}`);
    const id = receiptTokenID(selectedEvent);
    log.debug(`MintedReceipt# firstReceiptStore expecting receipt token id ${id}`);

    function matcher(event) {
      if (event?.args?.id.toHexString() === id.toHexString())
        return event;
      log.info(`MintedReceipt# ${id.toHexString()} != ${event?.args?.id?.toHexString()} in ${JSON.stringify(event)}`);
      return undefined;
    }

    const match = firstMatchingReceipt(
      matcher, $tokenContract, signature, null, ethers.constants.AddressZero, $signerAddress);

    match.subscribe(async (value) => {
      if (!value) return;

      const {receipt} = value;

      const URISignature = ethers.utils.id(ethers.utils.EventFragment.fromString("URI(string,uint256)").format());
      console.log(`URISignature: ${URISignature}`);
      for (const log of receipt.logs) {
        if (log.topics[0] !== URISignature) continue

        console.log(`HORAY!!! matched uri signature`);
        const uriEvent = parseEventLog($tokenContract, log);
        console.log(`${JSON.stringify(uriEvent.args)}`);
        const [metadataURI, tokenId] = uriEvent.args;
        mintedReceipt = ReceiptMetadata.fromTokenURI(tokenId, metadataURI)
        break;
      }
    });
    // subscribe to event arrival
    // subscribe to chainSwitch store
    // get the transaction receipt for the log from the provider
    // get the signature for the URL() event
    // find the log in the transaction receipt for the URL setting
    // use the URL to fetch the metadata
  }


  function receiptTokenID(event, which = 1) {
    const uuid = uuidFromIdentity(event.identity).replace(/-/g, '');
    let id = ethers.BigNumber.from('0x' + uuid + ethers.utils.hexZeroPad('0x0', 16).slice(2));
    id = id.add(which);
    return id;
  }

</script>
<div class="{mountClass}">
  <Listgroup active class="w-full">
  	<ListgroupItem class="text-base font-semibold gap-2">
  		item one {receiptTokenID($selectedEvent).toHexString()}
  		<CopyIconLink getText={() => `${receiptTokenID($selectedEvent).toHexString()}`} />
  	</ListgroupItem>
  	<ListgroupItem class="text-base font-semibold gap-2">
      {#if $receiptTokenTransfer}
        {JSON.stringify(Object.keys($receiptTokenTransfer))}
      {:else}
        token not found yet
      {/if}
  		<CopyIconLink getText={() => `${receiptTokenID($selectedEvent)}`} />
  	</ListgroupItem>

  </Listgroup>
</div>
