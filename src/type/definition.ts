import objectEntries from '../polyfills/objectEntries';

import inspect from '../jsutils/inspect';
import keyMap from '../jsutils/keyMap';
import mapValue from '../jsutils/mapValue';
import { Path } from '../jsutils/Path';
import devAssert from '../jsutils/devAssert';
import keyValMap from '../jsutils/keyValMap';
import { ObjMap } from '../jsutils/ObjMap';
import instanceOf from '../jsutils/instanceOf';
import isObjectLike from '../jsutils/isObjectLike';
import identityFunc from '../jsutils/identityFunc';
import defineToJSON from '../jsutils/defineToJSON';
import defineToStringTag from '../jsutils/defineToStringTag';
import { PromiseOrValue } from '../jsutils/PromiseOrValue';

import { Kind } from '../language/kinds';
import {
  ScalarTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  UnionTypeDefinitionNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  InputObjectTypeDefinitionNode,
  ScalarTypeExtensionNode,
  ObjectTypeExtensionNode,
  InterfaceTypeExtensionNode,
  UnionTypeExtensionNode,
  EnumTypeExtensionNode,
  InputObjectTypeExtensionNode,
  OperationDefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  ValueNode,
} from '../language/ast';

import { valueFromASTUntyped } from '../utilities/valueFromASTUntyped';

import { GraphQLSchema } from './schema';

// Predicates & Assertions

/**
 * These are all of the possible kinds of types.
 */
export type GraphQLType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLInputObjectType
  | GraphQLList<any>
  | GraphQLNonNull<any>;

export function isType(
  type: unknown,
): type is
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLInputObjectType {
  return (
    isScalarType(type) ||
    isObjectType(type) ||
    isInterfaceType(type) ||
    isUnionType(type) ||
    isEnumType(type) ||
    isInputObjectType(type) ||
    isListType(type) ||
    isNonNullType(type)
  );
}

export function assertType(type: unknown): GraphQLType {
  if (!isType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL type.`);
  }
  return type;
}

/**
 * There are predicates for each kind of GraphQL type.
 */
export function isScalarType(type: unknown): type is GraphQLScalarType {
  return instanceOf(type, GraphQLScalarType);
}

export function assertScalarType(type: unknown): GraphQLScalarType {
  if (!isScalarType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL Scalar type.`);
  }
  return type;
}

export function isObjectType(type: unknown): type is GraphQLObjectType {
  return instanceOf(type, GraphQLObjectType);
}

export function assertObjectType(type: unknown): GraphQLObjectType {
  if (!isObjectType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL Object type.`);
  }
  return type;
}

export function isInterfaceType(type: unknown): type is GraphQLInterfaceType {
  return instanceOf(type, GraphQLInterfaceType);
}

export function assertInterfaceType(type: unknown): GraphQLInterfaceType {
  if (!isInterfaceType(type)) {
    throw new Error(
      `Expected ${inspect(type)} to be a GraphQL Interface type.`,
    );
  }
  return type;
}

export function isUnionType(type: unknown): type is GraphQLUnionType {
  return instanceOf(type, GraphQLUnionType);
}

export function assertUnionType(type: unknown): GraphQLUnionType {
  if (!isUnionType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL Union type.`);
  }
  return type;
}

export function isEnumType(type: unknown): type is GraphQLEnumType {
  return instanceOf(type, GraphQLEnumType);
}

export function assertEnumType(type: unknown): GraphQLEnumType {
  if (!isEnumType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL Enum type.`);
  }
  return type;
}

export function isInputObjectType(
  type: unknown,
): type is GraphQLInputObjectType {
  return instanceOf(type, GraphQLInputObjectType);
}

export function assertInputObjectType(type: unknown): GraphQLInputObjectType {
  if (!isInputObjectType(type)) {
    throw new Error(
      `Expected ${inspect(type)} to be a GraphQL Input Object type.`,
    );
  }
  return type;
}

export function isListType(type: unknown): type is GraphQLList<any> {
  return instanceOf(type, GraphQLList);
}

export function assertListType(type: unknown): GraphQLList<any> {
  if (!isListType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL List type.`);
  }
  return type;
}

export function isNonNullType(type: unknown): type is GraphQLNonNull<any> {
  return instanceOf(type, GraphQLNonNull);
}

export function assertNonNullType(type: unknown): GraphQLNonNull<any> {
  if (!isNonNullType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL Non-Null type.`);
  }
  return type;
}

/**
 * These types may be used as input types for arguments and directives.
 */
export type GraphQLInputType =
  | GraphQLScalarType
  | GraphQLEnumType
  | GraphQLInputObjectType
  | GraphQLList<GraphQLInputType>
  | GraphQLNonNull<
      | GraphQLScalarType
      | GraphQLEnumType
      | GraphQLInputObjectType
      | GraphQLList<GraphQLInputType>
    >;

export function isInputType(type: unknown): type is GraphQLInputType {
  return (
    isScalarType(type) ||
    isEnumType(type) ||
    isInputObjectType(type) ||
    (isWrappingType(type) && isInputType(type.ofType))
  );
}

export function assertInputType(type: unknown): GraphQLInputType {
  if (!isInputType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL input type.`);
  }
  return type;
}

/**
 * These types may be used as output types as the result of fields.
 */
export type GraphQLOutputType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLList<GraphQLOutputType>
  | GraphQLNonNull<
      | GraphQLScalarType
      | GraphQLObjectType
      | GraphQLInterfaceType
      | GraphQLUnionType
      | GraphQLEnumType
      | GraphQLList<GraphQLOutputType>
    >;

export function isOutputType(type: unknown): type is GraphQLOutputType {
  return (
    isScalarType(type) ||
    isObjectType(type) ||
    isInterfaceType(type) ||
    isUnionType(type) ||
    isEnumType(type) ||
    (isWrappingType(type) && isOutputType(type.ofType))
  );
}

export function assertOutputType(type: unknown): GraphQLOutputType {
  if (!isOutputType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL output type.`);
  }
  return type;
}

/**
 * These types may describe types which may be leaf values.
 */
export type GraphQLLeafType = GraphQLScalarType | GraphQLEnumType;

export function isLeafType(type: unknown): type is GraphQLLeafType {
  return isScalarType(type) || isEnumType(type);
}

export function assertLeafType(type: unknown): GraphQLLeafType {
  if (!isLeafType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL leaf type.`);
  }
  return type;
}

/**
 * These types may describe the parent context of a selection set.
 */
export type GraphQLCompositeType =
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType;

export function isCompositeType(type: unknown): type is GraphQLCompositeType {
  return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
}

export function assertCompositeType(type: unknown): GraphQLCompositeType {
  if (!isCompositeType(type)) {
    throw new Error(
      `Expected ${inspect(type)} to be a GraphQL composite type.`,
    );
  }
  return type;
}

/**
 * These types may describe the parent context of a selection set.
 */
export type GraphQLAbstractType = GraphQLInterfaceType | GraphQLUnionType;

export function isAbstractType(type: unknown): type is GraphQLAbstractType {
  return isInterfaceType(type) || isUnionType(type);
}

export function assertAbstractType(type: unknown): GraphQLAbstractType {
  if (!isAbstractType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL abstract type.`);
  }
  return type;
}

/**
 * List Type Wrapper
 *
 * A list is a wrapping type which points to another type.
 * Lists are often created within the context of defining the fields of
 * an object type.
 *
 * Example:
 *
 *     const PersonType = new GraphQLObjectType({
 *       name: 'Person',
 *       fields: () => ({
 *         parents: { type: GraphQLList(PersonType) },
 *         children: { type: GraphQLList(PersonType) },
 *       })
 *     })
 *
 */
export type GraphQLList<T extends GraphQLType> = GraphQLListType<T>;
declare class GraphQLListType<T extends GraphQLType> {
  ofType: T;
  static<T extends GraphQLType>(ofType: T): GraphQLList<T>;
  // Note: constructors cannot be used for covariant types. Drop the "new".
  constructor(ofType: GraphQLType);
}
export function GraphQLList(this: any, ofType: unknown): void {
  if (this instanceof GraphQLList) {
    (this as any).ofType = assertType(ofType);
  } else {
    return new GraphQLList(ofType);
  }
}

// Need to cast through any to alter the prototype.
(GraphQLList.prototype as any).toString = function toString() {
  return '[' + String(this.ofType) + ']';
};

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLList);
defineToJSON(GraphQLList);

/**
 * Non-Null Type Wrapper
 *
 * A non-null is a wrapping type which points to another type.
 * Non-null types enforce that their values are never null and can ensure
 * an error is raised if this ever occurs during a request. It is useful for
 * fields which you can make a strong guarantee on non-nullability, for example
 * usually the id field of a database row will never be null.
 *
 * Example:
 *
 *     const RowType = new GraphQLObjectType({
 *       name: 'Row',
 *       fields: () => ({
 *         id: { type: GraphQLNonNull(GraphQLString) },
 *       })
 *     })
 *
 * Note: the enforcement of non-nullability occurs within the executor.
 */
export declare type GraphQLNonNull<
  T extends GraphQLNullableType
> = GraphQLNonNullType<T>;
declare class GraphQLNonNullType<T extends GraphQLNullableType> {
  ofType: T;
  static<T extends GraphQLNullableType>(ofType: T): GraphQLNonNull<T>;
  // Note: constructors cannot be used for covariant types. Drop the "new".
  constructor(ofType: GraphQLType);
}

export function GraphQLNonNull(this: any, ofType: unknown): void {
  if (this instanceof GraphQLNonNull) {
    (this as any).ofType = assertNullableType(ofType);
  } else {
    return new GraphQLNonNull(ofType);
  }
}

// Need to cast through any to alter the prototype.
(GraphQLNonNull.prototype as any).toString = function toString() {
  return String(this.ofType) + '!';
};

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLNonNull);
defineToJSON(GraphQLNonNull);

/**
 * These types wrap and modify other types
 */

export type GraphQLWrappingType = GraphQLList<any> | GraphQLNonNull<any>;

export function isWrappingType(type: unknown): type is GraphQLWrappingType {
  return isListType(type) || isNonNullType(type);
}

export function assertWrappingType(type: unknown): GraphQLWrappingType {
  if (!isWrappingType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL wrapping type.`);
  }
  return type;
}

/**
 * These types can all accept null as a value.
 */
export type GraphQLNullableType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLInputObjectType
  | GraphQLList<any>;

export function isNullableType(type: unknown): type is GraphQLNullableType {
  return isType(type) && !isNonNullType(type);
}

export function assertNullableType(type: unknown): GraphQLNullableType {
  if (!isNullableType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL nullable type.`);
  }
  return type;
}

export function getNullableType(type: void | null): void;
export function getNullableType<T extends GraphQLNullableType>(type: T): T;
export function getNullableType<T>(type: GraphQLNonNull<T>): T;
export function getNullableType(type: unknown) {
  if (type) {
    return isNonNullType(type) ? type.ofType : type;
  }
}

/**
 * These named types do not include modifiers like List or NonNull.
 */
export type GraphQLNamedType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLInputObjectType;

export function isNamedType(type: unknown): type is GraphQLNamedType {
  return (
    isScalarType(type) ||
    isObjectType(type) ||
    isInterfaceType(type) ||
    isUnionType(type) ||
    isEnumType(type) ||
    isInputObjectType(type)
  );
}

export function assertNamedType(type: unknown): GraphQLNamedType {
  if (!isNamedType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL named type.`);
  }
  return type;
}

/* eslint-disable no-redeclare */
export function getNamedType(type: void | null): void;
export function getNamedType(type: GraphQLType): GraphQLNamedType;
export function getNamedType(type: unknown) {
  /* eslint-enable no-redeclare */
  if (type) {
    let unwrappedType = type;
    while (isWrappingType(unwrappedType)) {
      unwrappedType = unwrappedType.ofType;
    }
    return unwrappedType;
  }
}

/**
 * Used while defining GraphQL types to allow for circular references in
 * otherwise immutable type definitions.
 */
export type Thunk<T> = (() => T) | T;

function resolveThunk<T>(thunk: Thunk<T>): T {
  return typeof thunk === 'function' ? thunk() : thunk;
}

function undefinedIfEmpty<T>(
  arr: ReadonlyArray<T> | null | undefined,
): ReadonlyArray<T> | undefined {
  return arr && arr.length > 0 ? arr : undefined;
}

/**
 * Scalar Type Definition
 *
 * The leaf values of any request and input values to arguments are
 * Scalars (or Enums) and are defined with a name and a series of functions
 * used to parse input from ast or variables and to ensure validity.
 *
 * If a type's serialize function does not return a value (i.e. it returns
 * `undefined`) then an error will be raised and a `null` value will be returned
 * in the response. If the serialize function returns `null`, then no error will
 * be included in the response.
 *
 * Example:
 *
 *     const OddType = new GraphQLScalarType({
 *       name: 'Odd',
 *       serialize(value) {
 *         if (value % 2 === 1) {
 *           return value;
 *         }
 *       }
 *     });
 *
 */
export class GraphQLScalarType {
  name: string;
  description: string | null | undefined;
  serialize: GraphQLScalarSerializer<any>;
  parseValue: GraphQLScalarValueParser<any>;
  parseLiteral: GraphQLScalarLiteralParser<any>;
  astNode: ScalarTypeDefinitionNode | null | undefined;
  extensionASTNodes: ReadonlyArray<ScalarTypeExtensionNode> | null | undefined;

  constructor(config: GraphQLScalarTypeConfig<any, any>) {
    const parseValue = config.parseValue || identityFunc;
    this.name = config.name;
    this.description = config.description;
    this.serialize = config.serialize || identityFunc;
    this.parseValue = parseValue;
    this.parseLiteral =
      config.parseLiteral || (node => parseValue(valueFromASTUntyped(node)));

    this.astNode = config.astNode;
    this.extensionASTNodes = undefinedIfEmpty(config.extensionASTNodes);
    devAssert(typeof config.name === 'string', 'Must provide name.');
    devAssert(
      config.serialize == null || typeof config.serialize === 'function',
      `${this.name} must provide "serialize" function. If this custom Scalar is also used as an input type, ensure "parseValue" and "parseLiteral" functions are also provided.`,
    );

    if (config.parseLiteral) {
      devAssert(
        typeof config.parseValue === 'function' &&
          typeof config.parseLiteral === 'function',
        `${this.name} must provide both "parseValue" and "parseLiteral" functions.`,
      );
    }
  }

  toConfig(): GraphQLScalarTypeConfig<any, any> & {
    serialize: GraphQLScalarSerializer<any>;
    parseValue: GraphQLScalarValueParser<any>;
    parseLiteral: GraphQLScalarLiteralParser<any>;
    extensionASTNodes: ReadonlyArray<ScalarTypeExtensionNode>;
  } {
    return {
      name: this.name,
      description: this.description,
      serialize: this.serialize,
      parseValue: this.parseValue,
      parseLiteral: this.parseLiteral,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes || [],
    };
  }

  toString(): string {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLScalarType);
defineToJSON(GraphQLScalarType);

export type GraphQLScalarSerializer<TExternal> = (
  value: unknown,
) => TExternal | null | undefined;
export type GraphQLScalarValueParser<TInternal> = (value: unknown) => TInternal;
export type GraphQLScalarLiteralParser<TInternal> = (
  valueNode: ValueNode,
  variables: ObjMap<unknown> | null | undefined,
) => TInternal;

export type GraphQLScalarTypeConfig<TInternal, TExternal> = {
  name: string;
  description?: string | null;
  // Serializes an internal value to include in a response.
  serialize?: GraphQLScalarSerializer<TExternal>;
  // Parses an externally provided value to use as an input.
  parseValue?: GraphQLScalarValueParser<TInternal>;
  // Parses an externally provided literal value to use as an input.
  parseLiteral?: GraphQLScalarLiteralParser<TInternal>;
  astNode?: ScalarTypeDefinitionNode | null | undefined;
  extensionASTNodes?: ReadonlyArray<ScalarTypeExtensionNode> | null | undefined;
};

/**
 * Object Type Definition
 *
 * Almost all of the GraphQL types you define will be object types. Object types
 * have a name, but most importantly describe their fields.
 *
 * Example:
 *
 *     const AddressType = new GraphQLObjectType({
 *       name: 'Address',
 *       fields: {
 *         street: { type: GraphQLString },
 *         number: { type: GraphQLInt },
 *         formatted: {
 *           type: GraphQLString,
 *           resolve(obj) {
 *             return obj.number + ' ' + obj.street
 *           }
 *         }
 *       }
 *     });
 *
 * When two types need to refer to each other, or a type needs to refer to
 * itself in a field, you can use a function expression (aka a closure or a
 * thunk) to supply the fields lazily.
 *
 * Example:
 *
 *     const PersonType = new GraphQLObjectType({
 *       name: 'Person',
 *       fields: () => ({
 *         name: { type: GraphQLString },
 *         bestFriend: { type: PersonType },
 *       })
 *     });
 *
 */
export class GraphQLObjectType {
  name: string;
  description: string | null | undefined;
  astNode: ObjectTypeDefinitionNode | null | undefined;
  extensionASTNodes: ReadonlyArray<ObjectTypeExtensionNode> | null | undefined;
  isTypeOf: GraphQLIsTypeOfFn<any, any> | null | undefined;

  _fields: Thunk<GraphQLFieldMap<any, any>>;
  _interfaces: Thunk<Array<GraphQLInterfaceType>>;

  constructor(config: GraphQLObjectTypeConfig<any, any>) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = undefinedIfEmpty(config.extensionASTNodes);
    this.isTypeOf = config.isTypeOf;
    this._fields = defineFieldMap.bind(undefined, config);
    this._interfaces = defineInterfaces.bind(undefined, config);
    devAssert(typeof config.name === 'string', 'Must provide name.');
    devAssert(
      config.isTypeOf == null || typeof config.isTypeOf === 'function',
      `${this.name} must provide "isTypeOf" as a function, ` +
        `but got: ${inspect(config.isTypeOf)}.`,
    );
  }

  getFields(): GraphQLFieldMap<any, any> {
    if (typeof this._fields === 'function') {
      this._fields = this._fields();
    }
    return this._fields;
  }

  getInterfaces(): Array<GraphQLInterfaceType> {
    if (typeof this._interfaces === 'function') {
      this._interfaces = this._interfaces();
    }
    return this._interfaces;
  }

  toConfig(): GraphQLObjectTypeConfig<any, any> & {
    interfaces: Array<GraphQLInterfaceType>;
    fields: GraphQLFieldConfigMap<any, any>;
    extensionASTNodes: ReadonlyArray<ObjectTypeExtensionNode>;
  } {
    return {
      name: this.name,
      description: this.description,
      isTypeOf: this.isTypeOf,
      interfaces: this.getInterfaces(),
      fields: fieldsToFieldsConfig(this.getFields()),
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes || [],
    };
  }

  toString(): string {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLObjectType);
defineToJSON(GraphQLObjectType);

function defineInterfaces(
  config: GraphQLObjectTypeConfig<unknown, unknown>,
): Array<GraphQLInterfaceType> {
  const interfaces = resolveThunk(config.interfaces) || [];
  devAssert(
    Array.isArray(interfaces),
    `${config.name} interfaces must be an Array or a function which returns an Array.`,
  );
  return interfaces;
}

function defineFieldMap<TSource, TContext>(
  config:
    | GraphQLObjectTypeConfig<TSource, TContext>
    | GraphQLInterfaceTypeConfig<TSource, TContext>,
): GraphQLFieldMap<TSource, TContext> {
  const fieldMap = resolveThunk(config.fields) || {};
  devAssert(
    isPlainObj(fieldMap),
    `${config.name} fields must be an object with field names as keys or a function which returns such an object.`,
  );

  return mapValue(fieldMap, (fieldConfig, fieldName) => {
    devAssert(
      isPlainObj(fieldConfig),
      `${config.name}.${fieldName} field config must be an object`,
    );
    devAssert(
      !('isDeprecated' in fieldConfig),
      `${config.name}.${fieldName} should provide "deprecationReason" instead of "isDeprecated".`,
    );
    devAssert(
      fieldConfig.resolve == null || typeof fieldConfig.resolve === 'function',
      `${config.name}.${fieldName} field resolver must be a function if ` +
        `provided, but got: ${inspect(fieldConfig.resolve)}.`,
    );

    const argsConfig = fieldConfig.args || {};
    devAssert(
      isPlainObj(argsConfig),
      `${config.name}.${fieldName} args must be an object with argument names as keys.`,
    );

    const args = objectEntries(argsConfig).map(([argName, arg]) => ({
      name: argName,
      description: arg.description === undefined ? null : arg.description,
      type: arg.type,
      defaultValue: arg.defaultValue,
      astNode: arg.astNode,
    }));

    return {
      ...fieldConfig,
      isDeprecated: Boolean(fieldConfig.deprecationReason),
      name: fieldName,
      args,
    };
  });
}

function isPlainObj(obj: unknown) {
  return isObjectLike(obj) && !Array.isArray(obj);
}

function fieldsToFieldsConfig(
  fields:
    | ObjMap<unknown>
    | ObjMap<GraphQLField<any, any, { [argument: string]: any }>>,
) {
  return mapValue(fields, (field: any) => ({
    type: field.type,
    args: argsToArgsConfig(field.args),
    resolve: field.resolve,
    subscribe: field.subscribe,
    deprecationReason: field.deprecationReason,
    description: field.description,
    astNode: field.astNode,
  }));
}

export function argsToArgsConfig(
  args: ReadonlyArray<GraphQLArgument>,
): GraphQLFieldConfigArgumentMap {
  return keyValMap(
    args,
    arg => arg.name,
    arg => ({
      type: arg.type,
      defaultValue: arg.defaultValue,
      description: arg.description,
      astNode: arg.astNode,
    }),
  );
}

export type GraphQLObjectTypeConfig<TSource, TContext> = {
  name: string;
  interfaces?: Thunk<Array<GraphQLInterfaceType> | null | undefined>;
  fields: Thunk<GraphQLFieldConfigMap<TSource, TContext>>;
  isTypeOf?: GraphQLIsTypeOfFn<TSource, TContext> | null | undefined;
  description?: string | null | undefined;
  astNode?: ObjectTypeDefinitionNode | null | undefined;
  extensionASTNodes?: ReadonlyArray<ObjectTypeExtensionNode> | null | undefined;
};

export type GraphQLTypeResolver<TSource, TContext> = (
  value: TSource,
  context: TContext,
  info: GraphQLResolveInfo,
  abstractType: GraphQLAbstractType,
) => PromiseOrValue<GraphQLObjectType | string | null | undefined>;

export type GraphQLIsTypeOfFn<TSource, TContext> = (
  source: TSource,
  context: TContext,
  info: GraphQLResolveInfo,
) => PromiseOrValue<boolean>;

export type GraphQLFieldResolver<
  TSource,
  TContext,
  TArgs = { [argument: string]: any }
> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => unknown;

export type GraphQLResolveInfo = {
  fieldName: string;
  fieldNodes: ReadonlyArray<FieldNode>;
  returnType: GraphQLOutputType;
  parentType: GraphQLObjectType;
  path: Path;
  schema: GraphQLSchema;
  fragments: ObjMap<FragmentDefinitionNode>;
  rootValue: unknown;
  operation: OperationDefinitionNode;
  variableValues: { [variable: string]: unknown };
};

export type GraphQLFieldConfig<
  TSource,
  TContext,
  TArgs = { [argument: string]: any }
> = {
  type: GraphQLOutputType;
  args?: GraphQLFieldConfigArgumentMap;
  resolve?: GraphQLFieldResolver<TSource, TContext, TArgs>;
  subscribe?: GraphQLFieldResolver<TSource, TContext, TArgs>;
  deprecationReason?: string | null | undefined;
  description?: string | null | undefined;
  astNode?: FieldDefinitionNode | null | undefined;
};

export type GraphQLFieldConfigArgumentMap = ObjMap<GraphQLArgumentConfig>;

export type GraphQLArgumentConfig = {
  type: GraphQLInputType;
  defaultValue?: unknown;
  description?: string | null | undefined;
  astNode?: InputValueDefinitionNode | null | undefined;
};

export type GraphQLFieldConfigMap<TSource, TContext> = ObjMap<
  GraphQLFieldConfig<TSource, TContext>
>;

export type GraphQLField<
  TSource,
  TContext,
  TArgs = { [argument: string]: any }
> = {
  name: string;
  description?: string | null;
  type: GraphQLOutputType;
  args: Array<GraphQLArgument>;
  resolve?: GraphQLFieldResolver<TSource, TContext, TArgs>;
  subscribe?: GraphQLFieldResolver<TSource, TContext, TArgs>;
  isDeprecated?: boolean;
  deprecationReason?: string | null;
  astNode?: FieldDefinitionNode | null;
};

export type GraphQLArgument = {
  name: string;
  type: GraphQLInputType;
  defaultValue?: unknown;
  description?: string | null;
  astNode?: InputValueDefinitionNode | null;
};

export function isRequiredArgument(
  arg: GraphQLArgument,
): arg is GraphQLNonNull<any> & {
  defaultValue: undefined;
  name: string;
  type: string;
} {
  return isNonNullType(arg.type) && arg.defaultValue === undefined;
}

export type GraphQLFieldMap<TSource, TContext> = ObjMap<
  GraphQLField<TSource, TContext>
>;

/**
 * Interface Type Definition
 *
 * When a field can return one of a heterogeneous set of types, a Interface type
 * is used to describe what types are possible, what fields are in common across
 * all types, as well as a function to determine which type is actually used
 * when the field is resolved.
 *
 * Example:
 *
 *     const EntityType = new GraphQLInterfaceType({
 *       name: 'Entity',
 *       fields: {
 *         name: { type: GraphQLString }
 *       }
 *     });
 *
 */
export class GraphQLInterfaceType {
  name: string;
  description?: string | null | undefined;
  astNode?: InterfaceTypeDefinitionNode | null | undefined;
  extensionASTNodes?:
    | ReadonlyArray<InterfaceTypeExtensionNode>
    | null
    | undefined;
  resolveType: GraphQLTypeResolver<any, any> | null | undefined;

  _fields: Thunk<GraphQLFieldMap<any, any>>;

  constructor(config: GraphQLInterfaceTypeConfig<any, any>) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = undefinedIfEmpty(config.extensionASTNodes);
    this.resolveType = config.resolveType;
    this._fields = defineFieldMap.bind(undefined, config);
    devAssert(typeof config.name === 'string', 'Must provide name.');
    devAssert(
      config.resolveType == null || typeof config.resolveType === 'function',
      `${this.name} must provide "resolveType" as a function, ` +
        `but got: ${inspect(config.resolveType)}.`,
    );
  }

  getFields(): GraphQLFieldMap<any, any> {
    if (typeof this._fields === 'function') {
      this._fields = this._fields();
    }
    return this._fields;
  }

  toConfig(): GraphQLInterfaceTypeConfig<any, any> & {
    fields: GraphQLFieldConfigMap<any, any>;
    extensionASTNodes: ReadonlyArray<InterfaceTypeExtensionNode>;
  } {
    return {
      name: this.name,
      description: this.description,
      resolveType: this.resolveType,
      fields: fieldsToFieldsConfig(this.getFields()),
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes || [],
    };
  }

  toString(): string {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLInterfaceType);
defineToJSON(GraphQLInterfaceType);

export type GraphQLInterfaceTypeConfig<TSource, TContext> = {
  name: string;
  fields: Thunk<GraphQLFieldConfigMap<TSource, TContext>>;
  /**
   * Optionally provide a custom type resolver function. If one is not provided,
   * the default implementation will call `isTypeOf` on each implementing
   * Object type.
   */
  resolveType?: GraphQLTypeResolver<TSource, TContext> | null | undefined;
  description?: string | null | undefined;
  astNode?: InterfaceTypeDefinitionNode | null | undefined;
  extensionASTNodes?:
    | ReadonlyArray<InterfaceTypeExtensionNode>
    | null
    | undefined;
};

/**
 * Union Type Definition
 *
 * When a field can return one of a heterogeneous set of types, a Union type
 * is used to describe what types are possible as well as providing a function
 * to determine which type is actually used when the field is resolved.
 *
 * Example:
 *
 *     const PetType = new GraphQLUnionType({
 *       name: 'Pet',
 *       types: [ DogType, CatType ],
 *       resolveType(value) {
 *         if (value instanceof Dog) {
 *           return DogType;
 *         }
 *         if (value instanceof Cat) {
 *           return CatType;
 *         }
 *       }
 *     });
 *
 */
export class GraphQLUnionType {
  name: string;
  description?: string | null;
  astNode?: UnionTypeDefinitionNode | null;
  extensionASTNodes?: ReadonlyArray<UnionTypeExtensionNode> | null;
  resolveType: GraphQLTypeResolver<any, any> | null;

  _types: Thunk<Array<GraphQLObjectType>>;

  constructor(config: GraphQLUnionTypeConfig<any, any>) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = undefinedIfEmpty(config.extensionASTNodes);
    this.resolveType = config.resolveType;
    this._types = defineTypes.bind(undefined, config);
    devAssert(typeof config.name === 'string', 'Must provide name.');
    devAssert(
      config.resolveType == null || typeof config.resolveType === 'function',
      `${this.name} must provide "resolveType" as a function, ` +
        `but got: ${inspect(config.resolveType)}.`,
    );
  }

  getTypes(): Array<GraphQLObjectType> {
    if (typeof this._types === 'function') {
      this._types = this._types();
    }
    return this._types;
  }

  toConfig(): GraphQLUnionTypeConfig<any, any> & {
    types: Array<GraphQLObjectType>;
    extensionASTNodes: ReadonlyArray<UnionTypeExtensionNode>;
  } {
    return {
      name: this.name,
      description: this.description,
      resolveType: this.resolveType,
      types: this.getTypes(),
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes || [],
    };
  }

  toString(): string {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLUnionType);
defineToJSON(GraphQLUnionType);

function defineTypes(
  config: GraphQLUnionTypeConfig<unknown, unknown>,
): Array<GraphQLObjectType> {
  const types = resolveThunk(config.types) || [];
  devAssert(
    Array.isArray(types),
    `Must provide Array of types or a function which returns such an array for Union ${config.name}.`,
  );
  return types;
}

export type GraphQLUnionTypeConfig<TSource, TContext> = {
  name: string;
  types: Thunk<Array<GraphQLObjectType>>;
  /**
   * Optionally provide a custom type resolver function. If one is not provided,
   * the default implementation will call `isTypeOf` on each implementing
   * Object type.
   */
  resolveType?: GraphQLTypeResolver<TSource, TContext> | null;
  description?: string | null;
  astNode?: UnionTypeDefinitionNode | null;
  extensionASTNodes?: ReadonlyArray<UnionTypeExtensionNode> | null;
};

/**
 * Enum Type Definition
 *
 * Some leaf values of requests and input values are Enums. GraphQL serializes
 * Enum values as strings, however internally Enums can be represented by any
 * kind of type, often integers.
 *
 * Example:
 *
 *     const RGBType = new GraphQLEnumType({
 *       name: 'RGB',
 *       values: {
 *         RED: { value: 0 },
 *         GREEN: { value: 1 },
 *         BLUE: { value: 2 }
 *       }
 *     });
 *
 * Note: If a value is not provided in a definition, the name of the enum value
 * will be used as its internal value.
 */
export class GraphQLEnumType {
  name: string;
  description: string | null | undefined;
  astNode: EnumTypeDefinitionNode | null | undefined;
  extensionASTNodes: ReadonlyArray<EnumTypeExtensionNode> | null | undefined;

  _values: Array<GraphQLEnumValue /* <T> */>;
  _valueLookup: Map<any /* T */, GraphQLEnumValue>;
  _nameLookup: ObjMap<GraphQLEnumValue>;

  constructor(config: GraphQLEnumTypeConfig /* <T> */) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = undefinedIfEmpty(config.extensionASTNodes);
    this._values = defineEnumValues(this.name, config.values);
    this._valueLookup = new Map(
      this._values.map(enumValue => [enumValue.value, enumValue]),
    );
    this._nameLookup = keyMap(this._values, value => value.name);

    devAssert(typeof config.name === 'string', 'Must provide name.');
  }

  getValues(): Array<GraphQLEnumValue /* <T> */> {
    return this._values;
  }

  getValue(name: string): GraphQLEnumValue | null {
    return this._nameLookup[name];
  }

  serialize(value: unknown /* T */): string | null | undefined {
    const enumValue = this._valueLookup.get(value);
    if (enumValue) {
      return enumValue.name;
    }
  }

  parseValue(value: unknown): any /* T */ | null | undefined {
    if (typeof value === 'string') {
      const enumValue = this.getValue(value);
      if (enumValue) {
        return enumValue.value;
      }
    }
  }

  parseLiteral(
    valueNode: ValueNode,
    _variables: ObjMap<unknown> | null | undefined,
  ): any /* T */ {
    if (valueNode.kind === Kind.ENUM) {
      const enumValue = this.getValue((valueNode as any).value);
      if (enumValue) {
        return enumValue.value;
      }
    }
  }

  toConfig(): GraphQLEnumTypeConfig & {
    extensionASTNodes: ReadonlyArray<EnumTypeExtensionNode>;
  } {
    const values = keyValMap(
      this.getValues(),
      value => value.name,
      value => ({
        description: value.description,
        value: value.value,
        deprecationReason: value.deprecationReason,
        astNode: value.astNode,
      }),
    );

    return {
      name: this.name,
      description: this.description,
      values,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes || [],
    };
  }

  toString(): string {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLEnumType);
defineToJSON(GraphQLEnumType);

function defineEnumValues(
  typeName: string,
  valueMap: GraphQLEnumValueConfigMap /* <T> */,
): Array<GraphQLEnumValue /* <T> */> {
  devAssert(
    isPlainObj(valueMap),
    `${typeName} values must be an object with value names as keys.`,
  );
  return objectEntries(valueMap).map(([valueName, value]) => {
    devAssert(
      isPlainObj(value),
      `${typeName}.${valueName} must refer to an object with a "value" key ` +
        `representing an internal value but got: ${inspect(value)}.`,
    );
    devAssert(
      !('isDeprecated' in value),
      `${typeName}.${valueName} should provide "deprecationReason" instead of "isDeprecated".`,
    );
    return {
      name: valueName,
      description: value.description,
      isDeprecated: Boolean(value.deprecationReason),
      deprecationReason: value.deprecationReason,
      astNode: value.astNode,
      value: 'value' in value ? value.value : valueName,
    };
  });
}

export type GraphQLEnumTypeConfig /* <T> */ = {
  name: string;
  values: GraphQLEnumValueConfigMap /* <T> */;
  description?: string | null | undefined;
  astNode?: EnumTypeDefinitionNode | null | undefined;
  extensionASTNodes?: ReadonlyArray<EnumTypeExtensionNode> | null | undefined;
};

export type GraphQLEnumValueConfigMap /* <T> */ = ObjMap<
  GraphQLEnumValueConfig /* <T> */
>;

export type GraphQLEnumValueConfig /* <T> */ = {
  value?: any /* T */;
  deprecationReason?: string | null | undefined;
  description?: string | null | undefined;
  astNode?: EnumValueDefinitionNode | null | undefined;
};

export type GraphQLEnumValue /* <T> */ = {
  name: string;
  description: string | null | undefined;
  isDeprecated?: boolean;
  deprecationReason: string | null | undefined;
  astNode?: EnumValueDefinitionNode | null | undefined;
  value: any /* T */;
};

/**
 * Input Object Type Definition
 *
 * An input object defines a structured collection of fields which may be
 * supplied to a field argument.
 *
 * Using `NonNull` will ensure that a value must be provided by the query
 *
 * Example:
 *
 *     const GeoPoint = new GraphQLInputObjectType({
 *       name: 'GeoPoint',
 *       fields: {
 *         lat: { type: GraphQLNonNull(GraphQLFloat) },
 *         lon: { type: GraphQLNonNull(GraphQLFloat) },
 *         alt: { type: GraphQLFloat, defaultValue: 0 },
 *       }
 *     });
 *
 */
export class GraphQLInputObjectType {
  name: string;
  description: string | null | undefined;
  astNode: InputObjectTypeDefinitionNode | null | undefined;
  extensionASTNodes:
    | ReadonlyArray<InputObjectTypeExtensionNode>
    | null
    | undefined;

  _fields: Thunk<GraphQLInputFieldMap>;

  constructor(config: GraphQLInputObjectTypeConfig) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = undefinedIfEmpty(config.extensionASTNodes);
    this._fields = defineInputFieldMap.bind(undefined, config);
    devAssert(typeof config.name === 'string', 'Must provide name.');
  }

  getFields(): GraphQLInputFieldMap {
    if (typeof this._fields === 'function') {
      this._fields = this._fields();
    }
    return this._fields;
  }

  toConfig(): GraphQLInputObjectTypeConfig & {
    fields: GraphQLInputFieldConfigMap;
    extensionASTNodes: ReadonlyArray<InputObjectTypeExtensionNode>;
  } {
    const fields = mapValue(this.getFields(), field => ({
      description: field.description,
      type: field.type,
      defaultValue: field.defaultValue,
      astNode: field.astNode,
    }));

    return {
      name: this.name,
      description: this.description,
      fields,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes || [],
    };
  }

  toString(): string {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLInputObjectType);
defineToJSON(GraphQLInputObjectType);

function defineInputFieldMap(
  config: GraphQLInputObjectTypeConfig,
): GraphQLInputFieldMap {
  const fieldMap = resolveThunk(config.fields) || {};
  devAssert(
    isPlainObj(fieldMap),
    `${config.name} fields must be an object with field names as keys or a function which returns such an object.`,
  );
  return mapValue(fieldMap, (fieldConfig, fieldName) => {
    devAssert(
      !('resolve' in fieldConfig),
      `${config.name}.${fieldName} field has a resolve property, but Input Types cannot define resolvers.`,
    );

    return { ...fieldConfig, name: fieldName };
  });
}

export type GraphQLInputObjectTypeConfig = {
  name: string;
  fields: Thunk<GraphQLInputFieldConfigMap>;
  description?: string | null | undefined;
  astNode?: InputObjectTypeDefinitionNode | null | undefined;
  extensionASTNodes?:
    | ReadonlyArray<InputObjectTypeExtensionNode>
    | null
    | undefined;
};

export type GraphQLInputFieldConfig = {
  type: GraphQLInputType;
  defaultValue?: unknown;
  description?: string | null | undefined;
  astNode?: InputValueDefinitionNode | null | undefined;
};

export type GraphQLInputFieldConfigMap = ObjMap<GraphQLInputFieldConfig>;

export type GraphQLInputField = {
  name: string;
  type: GraphQLInputType;
  defaultValue?: unknown;
  description?: string | null | undefined;
  astNode?: InputValueDefinitionNode | null | undefined;
};

export function isRequiredInputField(field: GraphQLInputField): boolean {
  return isNonNullType(field.type) && field.defaultValue === undefined;
}

export type GraphQLInputFieldMap = ObjMap<GraphQLInputField>;
