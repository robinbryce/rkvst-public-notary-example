{#if receipt}
<div class="{mountClass}">
  {#if encodings}
    <div class="flex-wrap m-2">
    <div class="flex">
      worldRoot {worldRoot} <CopyIconLink getText={()=>worldRoot}/>
    </div>
    {#if encodings.receiptUrl}
    <div class="flex">
    <!--<a class="mr-2" href="https://datatracker.ietf.org/doc/draft-birkholz-scitt-receipts/" target="_blank"><span class="underline">draft-birkholz-scitt-receipts</span></a> -->
    <a href="{encodings.receiptUrl}"download="{baseName}.b64.txt">
       base64 text <span class="underline">{baseName}.b64.txt</span>
    </a> <CopyIconLink getText={()=>receipt}/>
    </div>
    {/if}
    {#if encodings.payloadText}
    <div class="flex">
    <a href="{encodings.payloadJSONUrl}" target="_blank">receipt contents as <span class="underline">json</span></a>
    <CopyIconLink getText={()=>JSON.stringify(JSON.parse(encodings.payloadText), null, 2)}/>
    </div>
    {/if}
    </div>
  {/if}
</div>
{/if}
<script>

  import CopyIconLink from '$lib/components/utility/CopyIconLink.svelte';

  export let receipt;
  export let worldRoot;
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
    let i = bytes.indexOf(payloadMagic);
    if (i < 0) {
      console.log(`ERROR: magic marker not found in "${bytes}"`);
      return "";
    }
    return bytes.slice(i);
  }
</script>

