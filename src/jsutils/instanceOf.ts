/**
 * A replacement for instanceof which includes an error warning when multi-realm
 * constructors are detected.
 */

// Keep the message around, but only show it once (per instance of graphql-js that encounters mismatched constructors)
let warned = false;
// See: https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production
// See: https://webpack.js.org/guides/production/
export default process.env.NODE_ENV === 'production'
  ? // eslint-disable-next-line no-shadow
    function instanceOf<T>(
      value: unknown,
      constructor: new () => T,
    ): value is T {
      return (
        value instanceof constructor ||
        (value != null &&
          value.constructor != null &&
          constructor.name != null &&
          value.constructor.name == constructor.name)
      );
    }
  : // eslint-disable-next-line no-shadow
    function instanceOf<T>(
      value: unknown,
      constructor: new () => T,
    ): value is T {
      if (value instanceof constructor) {
        return true;
      }
      if (value) {
        const valueClass = value.constructor;
        const className = constructor.name;
        if (className && valueClass && valueClass.name === className) {
          if (!warned) {
            console.warn(
              `@apollo/graphql: Using ${className} "${value}" from another module or realm.
This could produce confusing and spurious results, especially if your "graphql"/"@apollo/graphql" versions are inconsistent.
You can use \`npm ls graphql\` and \`npm ls @apollo/graphql\` to ensure all versions are consistent.`, // TODO: determine what we mean by "consistent"
            );
            warned = true;
          }
          return true;
        }
      }
      return false;
    };
