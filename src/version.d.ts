/**
 * The publish name of this GraphQL.js library
 */
export const originModule: string;

/**
 * A string containing the version of the GraphQL.js library
 */
export const version: string;

/**
 * An object containing the components of the GraphQL.js version string
 */
export const versionInfo: {
  major: number;
  minor: number;
  patch: number;
  preReleaseTag: number | null;
};
