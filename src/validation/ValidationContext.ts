
import { ObjMap } from '../jsutils/ObjMap';

import { GraphQLError } from '../error/GraphQLError';
import { Kind } from '../language/kinds';
import { ASTVisitor, visit, visitWithTypeInfo } from '../language/visitor';

import {
  DocumentNode,
  OperationDefinitionNode,
  VariableNode,
  SelectionSetNode,
  FragmentSpreadNode,
  FragmentDefinitionNode,
} from '../language/ast';

import { GraphQLSchema } from '../type/schema';
import { GraphQLDirective } from '../type/directives';

import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLCompositeType,
  GraphQLField,
  GraphQLArgument,
} from '../type/definition';

import { TypeInfo } from '../utilities/TypeInfo';
type NodeWithSelectionSet = OperationDefinitionNode | FragmentDefinitionNode;

type VariableUsage = {
  readonly node: VariableNode;
  readonly type: GraphQLInputType | undefined | null;
  readonly defaultValue: unknown | undefined | null;
};

/**
 * An instance of this class is passed as the "this" context to all validators,
 * allowing access to commonly useful contextual information from within a
 * validation rule.
 */
export class ASTValidationContext {
  _ast: DocumentNode;
  _errors: Array<GraphQLError>;
  _fragments: ObjMap<FragmentDefinitionNode> | undefined | null;
  _fragmentSpreads: Map<SelectionSetNode, ReadonlyArray<FragmentSpreadNode>>;
  _recursivelyReferencedFragments: Map<
    OperationDefinitionNode,
    ReadonlyArray<FragmentDefinitionNode>
  >;

  constructor(ast: DocumentNode) {
    this._ast = ast;
    this._errors = [];
    this._fragments = undefined;
    this._fragmentSpreads = new Map();
    this._recursivelyReferencedFragments = new Map();
  }

  reportError(error: GraphQLError): void {
    this._errors.push(error);
  }

  getErrors(): ReadonlyArray<GraphQLError> {
    return this._errors;
  }

  getDocument(): DocumentNode {
    return this._ast;
  }

  getFragment(name: string): FragmentDefinitionNode | undefined | null {
    let fragments = this._fragments;
    if (!fragments) {
      this._fragments = fragments = this.getDocument().definitions.reduce(
        (frags, statement) => {
          if (statement.kind === Kind.FRAGMENT_DEFINITION) {
            frags[statement.name.value] = statement;
          }
          return frags;
        },
        Object.create(null),
      );
    }
    return fragments[name];
  }

  getFragmentSpreads(
    node: SelectionSetNode,
  ): ReadonlyArray<FragmentSpreadNode> {
    let spreads = this._fragmentSpreads.get(node);
    if (!spreads) {
      spreads = [];
      const setsToVisit: Array<SelectionSetNode> = [node];
      while (setsToVisit.length !== 0) {
        const set = setsToVisit.pop();
        for (const selection of set.selections) {
          if (selection.kind === Kind.FRAGMENT_SPREAD) {
            spreads.push(selection);
          } else if (selection.selectionSet) {
            setsToVisit.push(selection.selectionSet);
          }
        }
      }
      this._fragmentSpreads.set(node, spreads);
    }
    return spreads;
  }

  getRecursivelyReferencedFragments(
    operation: OperationDefinitionNode,
  ): ReadonlyArray<FragmentDefinitionNode> {
    let fragments = this._recursivelyReferencedFragments.get(operation);
    if (!fragments) {
      fragments = [];
      const collectedNames = Object.create(null);
      const nodesToVisit: Array<SelectionSetNode> = [operation.selectionSet];
      while (nodesToVisit.length !== 0) {
        const node = nodesToVisit.pop();
        for (const spread of this.getFragmentSpreads(node)) {
          const fragName = spread.name.value;
          if (collectedNames[fragName] !== true) {
            collectedNames[fragName] = true;
            const fragment = this.getFragment(fragName);
            if (fragment) {
              fragments.push(fragment);
              nodesToVisit.push(fragment.selectionSet);
            }
          }
        }
      }
      this._recursivelyReferencedFragments.set(operation, fragments);
    }
    return fragments;
  }
}

export type ASTValidationRule = (x0: ASTValidationContext) => ASTVisitor;

export class SDLValidationContext extends ASTValidationContext {
  _schema: GraphQLSchema | undefined | null;

  constructor(ast: DocumentNode, schema?: GraphQLSchema | undefined | null) {
    super(ast);
    this._schema = schema;
  }

  getSchema(): GraphQLSchema | undefined | null {
    return this._schema;
  }
}

export type SDLValidationRule = (x0: SDLValidationContext) => ASTVisitor;

export class ValidationContext extends ASTValidationContext {
  _schema: GraphQLSchema;
  _typeInfo: TypeInfo;
  _variableUsages: Map<NodeWithSelectionSet, ReadonlyArray<VariableUsage>>;
  _recursiveVariableUsages: Map<
    OperationDefinitionNode,
    ReadonlyArray<VariableUsage>
  >;

  constructor(schema: GraphQLSchema, ast: DocumentNode, typeInfo: TypeInfo) {
    super(ast);
    this._schema = schema;
    this._typeInfo = typeInfo;
    this._variableUsages = new Map();
    this._recursiveVariableUsages = new Map();
  }

  getSchema(): GraphQLSchema {
    return this._schema;
  }

  getVariableUsages(node: NodeWithSelectionSet): ReadonlyArray<VariableUsage> {
    let usages = this._variableUsages.get(node);
    if (!usages) {
      const newUsages = [];
      const typeInfo = new TypeInfo(this._schema);
      visit(
        node,
        visitWithTypeInfo(typeInfo, {
          VariableDefinition: () => false,
          Variable(variable) {
            newUsages.push({
              node: variable,
              type: typeInfo.getInputType(),
              defaultValue: typeInfo.getDefaultValue(),
            });
          },
        }),
      );
      usages = newUsages;
      this._variableUsages.set(node, usages);
    }
    return usages;
  }

  getRecursiveVariableUsages(
    operation: OperationDefinitionNode,
  ): ReadonlyArray<VariableUsage> {
    let usages = this._recursiveVariableUsages.get(operation);
    if (!usages) {
      usages = this.getVariableUsages(operation);
      for (const frag of this.getRecursivelyReferencedFragments(operation)) {
        usages = usages.concat(this.getVariableUsages(frag));
      }
      this._recursiveVariableUsages.set(operation, usages);
    }
    return usages;
  }

  getType(): GraphQLOutputType | undefined | null {
    return this._typeInfo.getType();
  }

  getParentType(): GraphQLCompositeType | undefined | null {
    return this._typeInfo.getParentType();
  }

  getInputType(): GraphQLInputType | undefined | null {
    return this._typeInfo.getInputType();
  }

  getParentInputType(): GraphQLInputType | undefined | null {
    return this._typeInfo.getParentInputType();
  }

  getFieldDef(): GraphQLField<unknown, unknown> | undefined | null {
    return this._typeInfo.getFieldDef();
  }

  getDirective(): GraphQLDirective | undefined | null {
    return this._typeInfo.getDirective();
  }

  getArgument(): GraphQLArgument | undefined | null {
    return this._typeInfo.getArgument();
  }
}

export type ValidationRule = (x0: ValidationContext) => ASTVisitor;
