import nodejsCustomInspectSymbol from './nodejsCustomInspectSymbol';

type Abstract<T> = Function & { prototype: T };
type Constructor<T> = new (...args: any[]) => T;
type Class<T> = Abstract<T> | Constructor<T>;

/**
 * The `defineToJSON()` function defines toJSON() and inspect() prototype
 * methods, if no function provided they become aliases for toString().
 */
export default function defineToJSON(
  classObject: Class<any>,
  fn: () => unknown = classObject.prototype.toString,
): void {
  classObject.prototype.toJSON = fn;
  classObject.prototype.inspect = fn;
  if (nodejsCustomInspectSymbol) {
    classObject.prototype[nodejsCustomInspectSymbol] = fn;
  }
}
