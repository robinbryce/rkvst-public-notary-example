/**
 * isUndefined performs ths safe and idiomatic check for an object or scalar being undefined
 * @param {object} value any object or scalar
 * @returns {boolean}
 */
export function isUndefined(value) {
	return typeof value === 'undefined';
}

/** isAsync checks if the value is an async function */
export function isAsync(value) {
	return value?.constructor?.name === 'AsyncFunction';
}

/** isPromise checks if the value is a promise */
export function isPromise(value) {
	if (typeof value === 'object' && typeof value.then === 'function') {
		return true;
	}
	return false;
}

/**
 * return true if the value is a callable that can be an 'await' subject
 * @param {*} value
 * @returns
 */
export function awaitable(value) {
	return isAsync(value) || isPromise(value);
}

export function isFunction(value) {
	return value?.constructor?.name === 'Function';
}

export async function awaitIfNecessary(callback, ...args) {
	if (awaitable(callback))
		return await callback(...args);
	return callback(...args);
}

/**
 * A variant of instanceof that also considers if o.constructor.name ===
 * class_.name Works where objects are passed across package boundaries, where
 * bundling causes the instanceof check to fail
 *
 * @param {*} o is any object
 * @param {*} class_ should be a class, but can be anything with a defined name property
 */
export function constructedLikeClass(o, class_) {
	return o instanceof class_ || (class_.name && o.constructor.name == class_.name);
}

export function etherrmsg(err) {
	if (!err.body) return `${err}`;
	try {
		const jerr = JSON.parse(err.body);
		return jerr.error?.message ?? `${err}`;
	} catch (err2) {
		return `${err}`;
	}
}

/** Given an ethers.BigNumber or a BigInt return the hex string representation.
 * If the argument is already a string, require a 0x prefix */
export function bigishToHex(id) {
  if (id.constructor.name === "BigNumber") {
    return id.toHexString();
  } else if (id.constructor.name === "BigInt") {
    return id.toString();
  } else if (id.constructor.name !== "String") {
    throw new Error(`cant convert ${id.constructor.name} to hex string`);
  } else if (!id.startsWith("0x")) {
    throw new Error(`${id} does not have the expected 0x hex prefix`);
  }
  return id;
}