// @flow strict

/**
 * Returns true if the value acts like a Promise, i.e. has a "then" function,
 * otherwise returns false.
 */
export default function isPromise(value: any): value is Promise<unknown> {
  return Boolean(value && typeof value.then === 'function');
}
