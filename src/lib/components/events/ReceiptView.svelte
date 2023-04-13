{#if receipt}
<div class="{mountClass}">
  {#if encodings}
   <List tag="ul" class="space-y-1">
    <Li>
      <a href="{encodings.receiptUrl}"download="{baseName}.b64.txt">draft-birkholz-scitt-receipts base64 text <span class="underline">{baseName}.b64.txt</span></a>
    </Li>
    {#if encodings.payloadText}
    <Li>
      <a href="{encodings.payloadJSONUrl}" target="_blank">receipt contents as <span class="underline">json</span></a>
    </Li>
    {/if}
   </List>
  {/if}
</div>
{/if}
<script>

  import { List, Li } from 'flowbite-svelte';
  export let receipt;
  // intended to be bound for retrieval
  export let encodings;
  $: {
    encodings = processReceipt(receipt);
  }

  // 
  export let baseName = "receipt"

  const mountClass = "mb-6 rounded-md border-dotted border-2 dark:bg-gray-700 font-normal text-gray-700 dark:text-gray-300 leading-tight"

  function processReceipt(receipt) {
    if (!receipt) return undefined;

    const parts = {};
    parts.base64 = receipt;
    parts.binary = atob(receipt); // ref: draft-birkholz-scitt-receipts
    parts.receiptUrl = encodeURI(`data:text/plain;charset=ascii,${receipt}`);
    if (parts.binary) {
      parts.payloadText = decodePayloadFromCBOR(parts.binary);
      parts.payloadJSONUrl = encodeURI(`data:application/json;charset=utf-8,${parts.payloadText}`);
    }
    if (parts.payloadText)
      parts.payload = JSON.parse(parts.payloadText);
    return parts;
  }

  /** this works because we know the payload is json and we know it is encoded
   * with stable sort and exactly what to expect in the first part of the
   * content */
  const payloadMagic = "{\"application_parameters\"" 
  function decodePayloadFromCBOR(bytes) {
    console.log(bytes);
    let i = bytes.indexOf(payloadMagic);
    if (i < 0) {
      console.log(`ERROR: magic marker not found in "${bytes}"`);
      return "";
    }
    return bytes.slice(i);
  }
</script>

