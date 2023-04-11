import * as env from '$env/static/public';
import { json, error } from '@sveltejs/kit';

const ARCHIVIST_API_STEM="archivist/"

export async function proxy (event) {

  // host:port/rkvst/io/archivist/*
  // -> ${PUBLIC_RKVST_URL}archivist/*

  const rkvstURL = env["PUBLIC_RKVST_URL"];
  const markerSegment = env["PUBLIC_RKVST_IO_SEGMENT"];

  let uin = new URL(event.request.url)
  let i = uin.pathname.indexOf(markerSegment)
  if (i < 0) {
    // if svelte kit is routing propertly this should not happen
    throw error(404, `bad path, missing ${markerSegment} in ${uin.href}`)
  }

  let path = trimStart(uin.pathname.slice(i+markerSegment.length), '/')
  if (!path.startsWith(ARCHIVIST_API_STEM)) {
    throw error(404, `bad path, must startWith ${ARCHIVIST_API_STEM}, not ${path}`);
  }

  const proxyUrl = new URL(trimEnd(rkvstURL, '/') + '/' + path);
  console.log(`${event.request.url} -> ${proxyUrl.href}`);
  const proxyHeaders = new Headers(event.request.headers);
  proxyHeaders.delete("host");
  const options = {
    method: event.request.method,
    headers: proxyHeaders,
    mode: event.request.mode,
    credentials: event.request.credentials,
    cache: event.request.cache,
    referer: event.request.referer,
  } 
  if (event.request.method === 'POST') {
    const data = await event.request.json();
    options.body = JSON.stringify(data);
    // options.keepalive = event.request.keepalive;
    // options.headers.push(['content-type', 'application/json'])
  }

  const proxyRequest = new Request(proxyUrl, options);
  console.log(proxyRequest.headers);
  console.log(proxyRequest.url);

  try {
    const upstream = await fetch(proxyRequest)
    const body = JSON.stringify(await upstream.json())
    const response = new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: [
        ['content-type', 'application/json'],
        ['date', upstream.headers.get('date')],
        ['vary', upstream.headers.get('vary')]
      ]
    })
    return response
  } catch (err) {
    console.log('ERROR: request headers', proxyRequest.headers)
    console.log('ERRRO: fetch error:', err)
    return json(err)
  }
}

export function trimEnd(path, value) {
  return path.endsWith(value) ? path.slice(0, path.length - value.length) : path
}

export function trimStart(path, value) {
  return path.startsWith(value) ? path.slice(value.length) : path
}