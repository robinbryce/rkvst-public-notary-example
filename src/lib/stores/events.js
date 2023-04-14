import * as env from '$env/static/public';
import { writable } from 'svelte/store';
export const selectedEvent = writable(undefined);
