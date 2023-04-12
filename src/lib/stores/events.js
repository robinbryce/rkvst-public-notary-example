import * as env from '$env/static/public';
import { asset } from '$lib/components/events/SelectedEventsCard.svelte';
import { writable } from 'svelte/store';

/*
 * Guarantees the all events on the most recently requested page are in the cache.
function createEventStore(assetUUID, queryOptions) {
  const { subscribe, set } = writable({

  });
  return {
    subscribe,
    set,
    load: async (pageToken) {
      try {

          const url = pageToken ? buildUrl(assetUUID, pageToken) : buildInitialUrl(assetUUID, queryOptions)

      } catch (err) {
         console.log(`ERROR: stores/events: ${err}`);
      }
    }
  }
}
*/