 /**
 * because ethers 5.x isn't happy on SSR in a package with type: module
 * @param {*} value 
 * @returns 
 */
export function hexlify(value) {
  // Convert the value to a hexadecimal string
  let hexString = value.toString(16);

  // Pad the string with zeros if necessary
  if (hexString.length % 2 !== 0) {
    hexString = '0' + hexString;
  }

  // Add the '0x' prefix
  return '0x' + hexString;
}