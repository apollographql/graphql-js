import { ASTNode } from '../language/ast';

import { GraphQLError } from './GraphQLError';

/**
 * Given an arbitrary Error, presumably thrown while attempting to execute a
 * GraphQL operation, produce a new GraphQLError aware of the location in the
 * document responsible for the original Error.
 */
export function locatedError(
  originalError: Error | GraphQLError,
  nodes: ReadonlyArray<ASTNode>,
  path: ReadonlyArray<string | number>,
): GraphQLError {
  // Note: this uses a brand-check to support GraphQL errors originating from
  // other contexts.
  if (originalError && Array.isArray((originalError as any).path)) {
    return originalError as any;
  }

  return new GraphQLError(
    originalError && originalError.message,
    (originalError && (originalError as any).nodes) || nodes,
    originalError && (originalError as any).source,
    originalError && (originalError as any).positions,
    path,
    originalError as any,
  );
}
