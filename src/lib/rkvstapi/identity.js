export function uuidFromIdentity(identity) {
  const parts = identity.split('/', 2);
  return parts.length && parts[parts.length - 1] || identity;
}
export function uuidAbbrev(uuid) {
  return uuid.slice(0, 6) + '...' + uuid.slice(uuid.length - 3);
}
export function identityAbbrev(identity) {
  return uuidAbbrev(uuidFromIdentity(identity));
}
