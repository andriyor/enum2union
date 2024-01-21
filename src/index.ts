import { Project, SyntaxKind, printNode } from 'ts-morph';

import {
  createObjectLiteralExpression,
  createTypeAliasDeclaration,
  createVariableStatement,
  trimQuotes,
} from './helpers';
import { ObjectMeta, StringObject } from './types';

export const transform = (projectFiles: string) => {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  const sourceFiles = project.getSourceFiles(projectFiles);

  for (const sourceFile of sourceFiles) {
    sourceFile.getDescendantsOfKind(SyntaxKind.EnumDeclaration).forEach((enumDeclaration) => {
      const enumMembers = enumDeclaration.getMembers();
      const isStringEnum = enumMembers.every((enumMember) =>
        enumMember.getInitializer()?.isKind(SyntaxKind.StringLiteral),
      );

      if (isStringEnum) {
        const object: StringObject = {};
        enumDeclaration.getMembers().forEach((enumMember) => {
          object[enumMember.getName()] = trimQuotes(enumMember.getInitializer()!.getText());
        });

        const obj: ObjectMeta = {
          name: enumDeclaration.getName(),
          object: object,
        };

        const objectLiteralExpression = createObjectLiteralExpression(obj.object);
        const variableStatement = createVariableStatement(obj.name, objectLiteralExpression);

        const enumIndex = enumDeclaration.getChildIndex();

        enumDeclaration.remove();

        // https://github.com/dsherret/ts-morph/issues/1192
        sourceFile.insertStatements(enumIndex, printNode(variableStatement));

        const typeAliasDeclaration = createTypeAliasDeclaration(obj.name);

        // https://github.com/dsherret/ts-morph/issues/1192
        sourceFile.insertStatements(enumIndex + 1, '\n' + printNode(typeAliasDeclaration));
      }
    });
  }

  return project.save();
};

// transform('./test/test-project/**');
