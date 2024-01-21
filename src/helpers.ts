import { ts } from 'ts-morph';
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
