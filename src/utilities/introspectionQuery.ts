
import { DirectiveLocationEnum } from '../language/directiveLocation';

export type IntrospectionOptions = {
  // Whether to include descriptions in the introspection result.
  // Default: true
  descriptions: boolean;
};

export function getIntrospectionQuery(options?: IntrospectionOptions): string {
  const descriptions = !(options && options.descriptions === false);
  return `
    query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          ${descriptions ? 'description' : ''}
          locations
          args {
            ...InputValue
          }
        }
      }
    }

    fragment FullType on __Type {
      kind
      name
      ${descriptions ? 'description' : ''}
      fields(includeDeprecated: true) {
        name
        ${descriptions ? 'description' : ''}
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        ${descriptions ? 'description' : ''}
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }

    fragment InputValue on __InputValue {
      name
      ${descriptions ? 'description' : ''}
      type { ...TypeRef }
      defaultValue
    }

    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
}

/**
 * Deprecated, call getIntrospectionQuery directly.
 *
 * This function will be removed in v15
 */
export const introspectionQuery = getIntrospectionQuery();

export type IntrospectionQuery = {
  readonly __schema: IntrospectionSchema;
};

export type IntrospectionSchema = {
  readonly queryType: IntrospectionNamedTypeRef<IntrospectionObjectType>;
  readonly mutationType:
    | IntrospectionNamedTypeRef<IntrospectionObjectType>
    | undefined
    | null;
  readonly subscriptionType:
    | IntrospectionNamedTypeRef<IntrospectionObjectType>
    | undefined
    | null;
  readonly types: ReadonlyArray<IntrospectionType>;
  readonly directives: ReadonlyArray<IntrospectionDirective>;
};

export type IntrospectionType =
  | IntrospectionScalarType
  | IntrospectionObjectType
  | IntrospectionInterfaceType
  | IntrospectionUnionType
  | IntrospectionEnumType
  | IntrospectionInputObjectType;

export type IntrospectionOutputType =
  | IntrospectionScalarType
  | IntrospectionObjectType
  | IntrospectionInterfaceType
  | IntrospectionUnionType
  | IntrospectionEnumType;

export type IntrospectionInputType =
  | IntrospectionScalarType
  | IntrospectionEnumType
  | IntrospectionInputObjectType;

export type IntrospectionScalarType = {
  readonly kind: 'SCALAR';
  readonly name: string;
  readonly description?: string | null;
};

export type IntrospectionObjectType = {
  readonly kind: 'OBJECT';
  readonly name: string;
  readonly description?: string | null;
  readonly fields: ReadonlyArray<IntrospectionField>;
  readonly interfaces: ReadonlyArray<
    IntrospectionNamedTypeRef<IntrospectionInterfaceType>
  >;
};

export type IntrospectionInterfaceType = {
  readonly kind: 'INTERFACE';
  readonly name: string;
  readonly description?: string | null;
  readonly fields: ReadonlyArray<IntrospectionField>;
  readonly possibleTypes: ReadonlyArray<
    IntrospectionNamedTypeRef<IntrospectionObjectType>
  >;
};

export type IntrospectionUnionType = {
  readonly kind: 'UNION';
  readonly name: string;
  readonly description?: string | null;
  readonly possibleTypes: ReadonlyArray<
    IntrospectionNamedTypeRef<IntrospectionObjectType>
  >;
};

export type IntrospectionEnumType = {
  readonly kind: 'ENUM';
  readonly name: string;
  readonly description?: string | null;
  readonly enumValues: ReadonlyArray<IntrospectionEnumValue>;
};

export type IntrospectionInputObjectType = {
  readonly kind: 'INPUT_OBJECT';
  readonly name: string;
  readonly description?: string | null;
  readonly inputFields: ReadonlyArray<IntrospectionInputValue>;
};

export type IntrospectionListTypeRef<T extends IntrospectionTypeRef> = {
  readonly kind: 'LIST';
  readonly ofType: T;
};

export type IntrospectionNonNullTypeRef<T extends IntrospectionTypeRef> = {
  readonly kind: 'NON_NULL';
  readonly ofType: T;
};

export type IntrospectionTypeRef =
  | IntrospectionNamedTypeRef<IntrospectionType>
  | IntrospectionListTypeRef<IntrospectionTypeRef>
  | IntrospectionNonNullTypeRef<
      | IntrospectionNamedTypeRef<IntrospectionType>
      | IntrospectionListTypeRef<IntrospectionTypeRef>
    >;

export type IntrospectionOutputTypeRef =
  | IntrospectionNamedTypeRef<IntrospectionOutputType>
  | IntrospectionListTypeRef<IntrospectionOutputTypeRef>
  | IntrospectionNonNullTypeRef<
      | IntrospectionNamedTypeRef<IntrospectionOutputType>
      | IntrospectionListTypeRef<IntrospectionOutputTypeRef>
    >;

export type IntrospectionInputTypeRef =
  | IntrospectionNamedTypeRef<IntrospectionInputType>
  | IntrospectionListTypeRef<IntrospectionInputTypeRef>
  | IntrospectionNonNullTypeRef<
      | IntrospectionNamedTypeRef<IntrospectionInputType>
      | IntrospectionListTypeRef<IntrospectionInputTypeRef>
    >;

export type IntrospectionNamedTypeRef<T extends IntrospectionType> = {
  readonly kind: T['kind'];
  readonly name: string;
};

export type IntrospectionField = {
  readonly name: string;
  readonly description?: string | null;
  readonly args: ReadonlyArray<IntrospectionInputValue>;
  readonly type: IntrospectionOutputTypeRef;
  readonly isDeprecated: boolean;
  readonly deprecationReason: string | undefined | null;
};

export type IntrospectionInputValue = {
  readonly name: string;
  readonly description?: string | null;
  readonly type: IntrospectionInputTypeRef;
  readonly defaultValue: string | undefined | null;
};

export type IntrospectionEnumValue = {
  readonly name: string;
  readonly description?: string | null;
  readonly isDeprecated: boolean;
  readonly deprecationReason: string | undefined | null;
};

export type IntrospectionDirective = {
  readonly name: string;
  readonly description?: string | null;
  readonly locations: ReadonlyArray<DirectiveLocationEnum>;
  readonly args: ReadonlyArray<IntrospectionInputValue>;
};
