import { EnumDeclaration, ts } from 'ts-morph';

import { StringObject } from './types';

export const trimQuotes = (str: string) => {
  return str.slice(1, -1);
};

export const createObjectLiteralExpression = (object: StringObject) => {
  const properties = Object.entries(object).map(([key, value]) => {
    return ts.factory.createPropertyAssignment(ts.factory.createIdentifier(key), ts.factory.createStringLiteral(value));
  });
  return ts.factory.createObjectLiteralExpression(properties, true);
};

export const createVariableStatement = (name: string, objectLiteralExpression: ts.Expression) => {
  return ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(name),
          undefined,
          undefined,
          ts.factory.createAsExpression(
            objectLiteralExpression,
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('const'), undefined),
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
};

export const createTypeAliasDeclaration = (name: string) => {
  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(name),
    undefined,
    ts.factory.createIndexedAccessTypeNode(
      ts.factory.createTypeQueryNode(ts.factory.createIdentifier(name), undefined),
      ts.factory.createTypeOperatorNode(
        ts.SyntaxKind.KeyOfKeyword,
        ts.factory.createTypeQueryNode(ts.factory.createIdentifier(name), undefined),
      ),
    ),
  );
};

export const createTypeAliasDeclarationWithHelper = (name: string) => {
  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(name),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('ObjectValues'), [
      ts.factory.createTypeQueryNode(ts.factory.createIdentifier(name), undefined),
    ]),
  );
};

export const createImportDeclaration = (importPath: string) => {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('ObjectValues')),
      ]),
    ),
    ts.factory.createStringLiteral(importPath),
    undefined,
  );
};

export const createObjectFromEnum = (enumDeclaration: EnumDeclaration) => {
  const object: StringObject = {};
  enumDeclaration.getMembers().forEach((enumMember) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    object[enumMember.getName()] = trimQuotes(enumMember.getInitializer()?.getText());
  });
  return object;
};
