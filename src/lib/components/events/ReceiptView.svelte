<script>
  import { Listgroup, ListgroupItem } from 'flowbite-svelte';
	import CopyIconLink from '$lib/components/utility/CopyIconLink.svelte';
	import { DecodedReceipt } from '$lib/receipt.js';

	export let receipt;
	export let worldRoot;
	export let savedReceipt = undefined;
	// intended to be bound for retrieval
	export let receiptEncodings = undefined;

  const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';
  const ipfsSchemePrefix = 'ipfs://'

	$: {
		if (receipt) receiptEncodings = new DecodedReceipt(receipt);
	}

	//
	export let baseName = 'receipt';

	const mountClass =
		'mb-6 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight';

  function gatewayIPFSUrl(ipfsURL) {
    if (!ipfsURL.startsWith(ipfsSchemePrefix))
      throw new Error(`${ipfsURL} is not an ipfs scheme url`);
    return ipfsGatewayPrefix + ipfsURL.slice(ipfsSchemePrefix.length);
  }
</script>

{#if receipt}
  <div class={mountClass}>
		{#if receiptEncodings}
      <Listgroup active class="w-full">
        <ListgroupItem class="text-base font-semibold gap-2">
					worldRoot {worldRoot}
					<CopyIconLink getText={() => worldRoot} />
        </ListgroupItem>

				{#if receiptEncodings.receiptUrl}
        <ListgroupItem class="text-base font-semibold gap-2">
						<!--<a class="mr-2" href="https://datatracker.ietf.org/doc/draft-birkholz-scitt-receipts/" target="_blank"><span class="underline">draft-birkholz-scitt-receipts</span></a> -->
						<a href={receiptEncodings.receiptUrl} download="{baseName}.b64.txt">
							base64 text <span class="underline">{baseName}.b64.txt</span>
						</a>
						<CopyIconLink getText={() => receipt} />
        </ListgroupItem>
        {/if}
				{#if receiptEncodings.payloadText}
          <ListgroupItem class="text-base font-semibold gap-2">
						<a href={receiptEncodings.payloadJSONUrl} target="_blank"
							>receipt contents as <span class="underline">json</span></a
						>
						<CopyIconLink
							getText={() => JSON.stringify(JSON.parse(receiptEncodings.payloadText), null, 2)}
						/>
          </ListgroupItem>
				{/if}
				{#if !savedReceipt}
					<div class="flex">
						<p>This receipt has not been saved yet</p>
					</div>
				{:else}
          <ListgroupItem class="text-base font-semibold gap-2">
						<a href={gatewayIPFSUrl(savedReceipt.receipt_url) } target="_blank">
              on ipfs<span class="ml-2 underline">receipt.b64.json</span></a>
          </ListgroupItem>
          <ListgroupItem class="text-base font-semibold gap-2">
						<a href={gatewayIPFSUrl(savedReceipt.receipt_content_url)} target="_blank">
              on ipfs<span class="ml-2 underline">receipt-content.json</span></a>
          </ListgroupItem>
          <ListgroupItem class="text-base font-semibold gap-2">
            <p>Please note, the following links require a browser plugin. The benefit is that they are not dependent on a http gateway</p>
          </ListgroupItem>
          <ListgroupItem class="text-base font-semibold gap-2">
						<a href={savedReceipt.receipt_url} target="_blank">
              raw ipfs url for <span class="ml-2 underline">receipt.b64.json</span></a>
          </ListgroupItem>
          <ListgroupItem class="text-base font-semibold gap-2">
						<a href={savedReceipt.receipt_content_url} target="_blank">
              raw ipfs url for<span class="ml-2 underline">receipt-content.json</span></a>
          </ListgroupItem>
        {/if}

      </Listgroup>
    {/if}
  </div>
{/if}
