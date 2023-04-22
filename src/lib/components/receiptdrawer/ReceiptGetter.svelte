<ButtonWithPopover
  id="get_receipt1"
  buttonText="Get Receipt"
  popText="Fetch an off line verifiable receipt for an RKVST event from the RKVST"
  handleClick={getSelectedEventReceipt}/>
<script>
  import ButtonWithPopover from "$lib/components/utility/ButtonWithPopover.svelte";

	import { getReceipt } from '$lib/rkvstapi/getreceipt.js';
	import { getBlock } from '$lib/rkvstapi/getblock';
	import { ReceiptDetails } from '$lib/receipt.js';

	import { selectedEvent } from '$lib/stores/events.js';

  export let receipt = undefined;
  export let getting = false;
  export let worldRoot = undefined;

	async function getSelectedEventReceipt() {
		if (getting) return;

		const event = $selectedEvent;
		if (!event) return;
		const blockNumber = $selectedEvent.block_number;
		if (!blockNumber) return;

		getting = true;
    let receiptBlock;
		try {
			// get the world root first, this verifies we have a valid block.
			receiptBlock = await getBlock(blockNumber);
		} catch (err) {
			console.log(`ERROR: error getting block ${err}`);
			getting = false;
			return;
		}

		// RKVST runs go-quorum based ledgers and utilizes their private state
		// feature to provide auditability and confidentiality at the same time.
		//
		// Each node in a quorum network puts private transaction data in a node
		// specific merkle tree. The hash of the private transaction is committed to
		// the public (ethereum) world sate. For that reason we need the
		// privateStateRoot to verify the proofs. For any private transaction it is
		// always possible to check that is hash is in the public state. But it is
		// un-necessary to do so.
		//
		// Note that public events are recorded using private transactions that are
		// 'shared' with the configured public node. All events, for both restricted
		// and public events, are recorded on the quorum blockchain using private
		// transactions.
		worldRoot = receiptBlock.privateStateRoot;
		// this can take a second or so
    let receiptBase64;
		try {
			receiptBase64 = await getReceipt(event.identity, blockNumber);
		} catch (err) {
      getting = false;
			console.log(`ERROR: error getting receipt ${err}`);
      return;
		}
		getting = false;
    $receipt = ReceiptDetails.fromReceipt(receiptBase64);
	}

</script>

