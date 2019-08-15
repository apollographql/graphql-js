/**
 * The set of allowed kind values for AST nodes.
 */
export const Kind = Object.freeze({
  // Name
  NAME: 'Name' as 'Name',

  // Document
  DOCUMENT: 'Document' as 'Document',
  OPERATION_DEFINITION: 'OperationDefinition' as 'OperationDefinition',
  VARIABLE_DEFINITION: 'VariableDefinition' as 'VariableDefinition',
  SELECTION_SET: 'SelectionSet' as 'SelectionSet',
  FIELD: 'Field' as 'Field',
  ARGUMENT: 'Argument' as 'Argument',

  // Fragments
  FRAGMENT_SPREAD: 'FragmentSpread' as 'FragmentSpread',
  INLINE_FRAGMENT: 'InlineFragment' as 'InlineFragment',
  FRAGMENT_DEFINITION: 'FragmentDefinition' as 'FragmentDefinition',

  // Values
  VARIABLE: 'Variable' as 'Variable',
  INT: 'IntValue' as 'IntValue',
  FLOAT: 'FloatValue' as 'FloatValue',
  STRING: 'StringValue' as 'StringValue',
  BOOLEAN: 'BooleanValue' as 'BooleanValue',
  NULL: 'NullValue' as 'NullValue',
  ENUM: 'EnumValue' as 'EnumValue',
  LIST: 'ListValue' as 'ListValue',
  OBJECT: 'ObjectValue' as 'ObjectValue',
  OBJECT_FIELD: 'ObjectField' as 'ObjectField',

  // Directives
  DIRECTIVE: 'Directive' as 'Directive',

  // Types
  NAMED_TYPE: 'NamedType' as 'NamedType',
  LIST_TYPE: 'ListType' as 'ListType',
  NON_NULL_TYPE: 'NonNullType' as 'NonNullType',

  // Type System Definitions
  SCHEMA_DEFINITION: 'SchemaDefinition' as 'SchemaDefinition',
  OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition' as 'OperationTypeDefinition',

  // Type Definitions
  SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition' as 'ScalarTypeDefinition',
  OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition' as 'ObjectTypeDefinition',
  FIELD_DEFINITION: 'FieldDefinition' as 'FieldDefinition',
  INPUT_VALUE_DEFINITION: 'InputValueDefinition' as 'InputValueDefinition',
  INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition' as 'InterfaceTypeDefinition',
  UNION_TYPE_DEFINITION: 'UnionTypeDefinition' as 'UnionTypeDefinition',
  ENUM_TYPE_DEFINITION: 'EnumTypeDefinition' as 'EnumTypeDefinition',
  ENUM_VALUE_DEFINITION: 'EnumValueDefinition' as 'EnumValueDefinition',
  INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition' as 'InputObjectTypeDefinition',

  // Directive Definitions
  DIRECTIVE_DEFINITION: 'DirectiveDefinition' as 'DirectiveDefinition',

  // Type System Extensions
  SCHEMA_EXTENSION: 'SchemaExtension' as 'SchemaExtension',

  // Type Extensions
  SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension' as 'ScalarTypeExtension',
  OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension' as 'ObjectTypeExtension',
  INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension' as 'InterfaceTypeExtension',
  UNION_TYPE_EXTENSION: 'UnionTypeExtension' as 'UnionTypeExtension',
  ENUM_TYPE_EXTENSION: 'EnumTypeExtension' as 'EnumTypeExtension',
  INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension' as 'InputObjectTypeExtension',
});

/**
 * The enum type representing the possible kind values of AST nodes.
 */
export type KindEnum = typeof Kind[keyof typeof Kind];
