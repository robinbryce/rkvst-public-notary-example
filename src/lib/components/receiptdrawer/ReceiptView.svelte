<script>
	import { Listgroup, ListgroupItem, Hr } from 'flowbite-svelte';
	import CopyIconLink from '$lib/components/utility/CopyIconLink.svelte';

	export let receipt;
	export let worldRoot;
	export let metadata = undefined;

	const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';
	const ipfsSchemePrefix = 'ipfs://';

	export let baseName = 'receipt';

	const mountClass =
		'mb-6 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight';

	function gatewayIPFSUrl(ipfsURL) {
		if (!ipfsURL.startsWith(ipfsSchemePrefix))
			throw new Error(`${ipfsURL} is not an ipfs scheme url`);
		return ipfsGatewayPrefix + ipfsURL.slice(ipfsSchemePrefix.length);
	}

</script>

{#if receipt?.base64}
	<div class={mountClass}>
			<Listgroup active class="w-full">
				<ListgroupItem class="text-base font-semibold gap-2">
					worldRoot {worldRoot}
					<CopyIconLink getText={() => worldRoot} />
				</ListgroupItem>

				{#if receipt.receiptUrl}
					<ListgroupItem class="text-base font-semibold gap-2">
						<!--<a class="mr-2" href="https://datatracker.ietf.org/doc/draft-birkholz-scitt-receipts/" target="_blank"><span class="underline">draft-birkholz-scitt-receipts</span></a> -->
						<a href={receipt.receiptUrl} download="{baseName}.b64.txt">
							base64 text <span class="underline">{baseName}.b64.txt</span>
						</a>
						<CopyIconLink getText={() => receipt.base64} />
					</ListgroupItem>
				{/if}
				{#if receipt.payloadText}
					<ListgroupItem class="text-base font-semibold gap-2">
						<a href={receipt.payloadJSONUrl} target="_blank"
							>receipt contents as <span class="underline">json</span></a
						>
						<CopyIconLink
							getText={() => JSON.stringify(JSON.parse(receipt.payloadText), null, 2)}
						/>
					</ListgroupItem>
				{/if}
				{#if !receipt.isSaved()}
					<div class="flex">
						<p>This receipt has not been saved yet</p>
					</div>
				{:else}
					<ListgroupItem class="text-base font-semibold gap-2">
						<a href={gatewayIPFSUrl(receipt.ipfs.receipt_url)} target="_blank">
							on ipfs<span class="ml-2 underline">receipt.b64.json</span></a
						>
					</ListgroupItem>
					<ListgroupItem class="text-base font-semibold gap-2">
						<a href={gatewayIPFSUrl(receipt.ipfs.receipt_content_url)} target="_blank">
							on ipfs<span class="ml-2 underline">receipt-content.json</span></a
						>
					</ListgroupItem>
					<ListgroupItem class="text-base font-semibold gap-2">
						<p>
							Please note, the following links require a browser plugin. The benefit is that they
							are not dependent on a http gateway
						</p>
					</ListgroupItem>
					<ListgroupItem class="text-base font-semibold gap-2">
						<a href={receipt.ipfs.receipt_url} target="_blank">
							raw ipfs url for <span class="ml-2 underline">receipt.b64.txt</span></a
						>
					</ListgroupItem>
					<ListgroupItem class="text-base font-semibold gap-2">
						<a href={receipt.ipfs.receipt_content_url} target="_blank">
							raw ipfs url for<span class="ml-2 underline">receipt-content.json</span></a
						>
					</ListgroupItem>
				{/if}
				{#if receipt.isSaved() && !metadata}
					<div class="flex">
						<p>This receipt has not been minted yet</p>
					</div>
				{:else if metadata}
					<ListgroupItem class="text-base font-semibold gap-2">
						<a href={metadata.url} target="_blank">
							raw ipfs url for<span class="ml-2 underline">nft metadata</span></a
						>
					</ListgroupItem>
				{/if}
			</Listgroup>
	</div>
{/if}
