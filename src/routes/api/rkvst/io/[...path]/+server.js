
import { proxy } from '../proxy.js'

export async function GET (event) {
  return proxy(event, {authorize: true});
}

export async function POST (event) {
  return proxy(event, {authorize: true});
};
