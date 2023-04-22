<ButtonWithPopover
  id="save_receipt1"
  buttonText="Save Receipt"
  popText="Save the receipt to ipfs"
  handleClick={saveCurrentReceipt}/>
<script>
  import ButtonWithPopover from "$lib/components/utility/ButtonWithPopover.svelte";
	import { ReceiptDetails } from '$lib/receipt.js';

	import { selectedEvent } from '$lib/stores/events.js';

  export let receipt = undefined;
  export let saving = false;
  export let storeURL = '/api/nft-storage/store/receipt';

	async function saveCurrentReceipt() {
		console.log(`saveCurrentReceipt: ${saving} ${$receipt?.base64}`);
		if (saving) return;
		if (!$receipt?.base64) return;

		const body = {
			receipt_base64: $receipt.base64
		};
		let options = {
			method: 'POST',
			headers: new Headers([['content-type', 'application/json']]),
			body: JSON.stringify(body)
		};

		let resp;
		saving = true;
		try {
			console.log(`saving receipt: ${storeURL}`);
			resp = await fetch(storeURL, options);
			const ipfsLinks = await resp.json();
      $receipt.updateIPFS(ipfsLinks);
      $receipt = ReceiptDetails.copy($receipt)
		} catch (err) {
			console.log(
				`ERROR: saving receipt for ${$selectedEvent.identity} ${storeURL} ${resp.statusText} ${err}`
			);
			throw err;
		}
		console.log(`saved receipt ${JSON.stringify($receipt.ipfs, null, '  ')}`);
		saving = false;
	}


</script>