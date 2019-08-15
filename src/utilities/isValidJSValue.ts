
/* istanbul ignore file */
import { GraphQLInputType } from '../type/definition';

import { coerceValue } from './coerceValue';

/**
 * Deprecated. Use coerceInputValue() directly for richer information.
 *
 * This function will be removed in v15
 */
export function isValidJSValue(
  value: unknown,
  type: GraphQLInputType,
): Array<string> {
  const errors = coerceValue(value, type).errors;
  return errors ? errors.map(error => error.message) : [];
}
