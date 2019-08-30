type Abstract<T> = () => {} & { prototype: T };
type Constructor<T> = new (...args: any[]) => T;
type Class<T> = Abstract<T> | Constructor<T>;

type WithOrigin<T> = T & { ORIGIN_MODULE: string };

import { originModule } from '../version';

// Keep track of what versions we've seen, don't log the same ones twice
// Also, don't log if we see our own version.
const encounteredGraphQLVersions = new Set([originModule]);

/**
 * A replacement for instanceof which includes an error warning when multi-realm
 * constructors are detected.
 */
export default process.env.NODE_ENV === 'production'
  ? function instanceOf<T>(
      value: any,
      /**
       * The actual name and version that get logged come from the value class,
       * but by ensuring the constructor is named and versioned, we have a better chance of having name and version in the value too
       */
      constructor: WithOrigin<Class<T>>,
    ): value is T {
      if (value instanceof constructor) {
        return true;
      }
      if (value) {
        const valueClass = value.constructor;
        const className = constructor.name;
        return className && valueClass && valueClass.name === className;
      }
      return false;
    }
  : function instanceOf<T>(
      value: any,
      /**
       * The actual name and version that get logged come from the value class,
       * but by ensuring the constructor is named and versioned, we have a better chance of having name and version in the value too
       */
      constructor: WithOrigin<Class<T>>,
    ): value is T {
      if (value instanceof constructor) {
        return true;
      }
      if (value) {
        const valueClass = value.constructor;
        const className = constructor.name;
        if (className && valueClass && valueClass.name === className) {
          const otherModule = valueClass.ORIGIN_MODULE || 'graphql@<15.0.0';
          if (!encounteredGraphQLVersions.has(otherModule)) {
            /* eslint-disable */
            console.warn(
              `${originModule}: Encountered graphql object from ${otherModule}. Mixing graphql packages can produce confusing and spurious results.`,
            );
            encounteredGraphQLVersions.add(otherModule);
          }
          return true;
        }
      }
      return false;
    };
