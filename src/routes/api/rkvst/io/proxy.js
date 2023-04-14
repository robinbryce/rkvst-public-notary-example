import * as env from '$env/static/public';
import { json, error } from '@sveltejs/kit';

import { getToken } from './authorize.js';

const ARCHIVIST_API_STEM = 'archivist/';

/**
 * This proxy method is used by arbitrary paths under 'api/rkvst/io' to proxy requests to the RKVST api.
 * If the proxyOption authorize is true then the `Authorization: Bearer ${TOKEN}` header is injected.
 *
 * Note: The app.rkvst.io/archivist/publicassets route does not require
 * authentication and should be generally be accessed directly.
 * @param {*} event
 * @param {*} proxyOptions
 * @returns
 */
export async function proxy(event, proxyOptions) {
	// host:port/rkvst/io/archivist/*
	// -> ${PUBLIC_RKVST_URL}archivist/*

	const rkvstURL = env['PUBLIC_RKVST_URL'];
	const markerSegment = env['PUBLIC_RKVST_IO_SEGMENT'];

	let uin = new URL(event.request.url);
	let i = uin.pathname.indexOf(markerSegment);
	if (i < 0) {
		// if svelte kit is routing propertly this should not happen
		throw error(404, `bad path, missing ${markerSegment} in ${uin.href}`);
	}

	// Note: be sure to put the query string back
	let path = trimStart(uin.pathname.slice(i + markerSegment.length), '/') + uin.search;
	if (!path.startsWith(ARCHIVIST_API_STEM)) {
		throw error(404, `bad path, must startWith ${ARCHIVIST_API_STEM}, not ${path}`);
	}

	const proxyUrl = new URL(trimEnd(rkvstURL, '/') + '/' + path);

	const proxyHeaders = new Headers(event.request.headers);
	proxyHeaders.delete('host');
	if (proxyOptions?.authorize) {
		// There are ways to cache the token in service workers and edge functions,
		// but doing so puts the token in process global state. That is probably
		// fine, but is over-reach for a demo like this. Getting it every time also
		// avoids the 'oh my token silently expired' problem.
		const token = await getToken();
		// console.log(token); // SECURITY LEAK
		proxyHeaders.set('Authorization', `Bearer ${token}`);
	}
	proxyHeaders.set('Content-Type', 'application/json');

	// Note: When the fetch comes from the browser, we get the user agent headers
	// and those trigger pendo For typical api applications this is not an issue.
	proxyHeaders.delete('user-agent');

	const options = {
		method: event.request.method,
		headers: proxyHeaders,
		mode: event.request.mode,
		credentials: event.request.credentials,
		cache: event.request.cache,
		referer: event.request.referer
	};
	if (event.request.method === 'POST') {
		const data = await event.request.json();
		options.body = JSON.stringify(data);
	}

	const proxyRequest = new Request(proxyUrl, options);
	// console.log(proxyRequest.headers); // SECURITY LEAK
	// console.log(`${event.request.url} -> ${proxyUrl.href}`);

	try {
		const upstream = await event.fetch(proxyRequest);
		const body = JSON.stringify(await upstream.json());
		const response = new Response(body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers: [
				['content-type', 'application/json'],
				['date', upstream.headers.get('date')],
				['vary', upstream.headers.get('vary')]
			]
		});
		return response;
	} catch (err) {
		console.log('ERROR: fetch error:', err);
		return json(err);
	}
}

export function trimEnd(path, value) {
	return path.endsWith(value) ? path.slice(0, path.length - value.length) : path;
}

export function trimStart(path, value) {
	return path.startsWith(value) ? path.slice(value.length) : path;
}
