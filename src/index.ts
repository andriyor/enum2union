import { typeFlag } from 'type-flag';
import { Project, SyntaxKind, printNode } from 'ts-morph';

import {
  createObjectFromEnum,
  createObjectLiteralExpression,
  createTypeAliasDeclaration,
  createVariableStatement,
} from './helpers';
import { VarMeta } from './types';

const parsed = typeFlag({
  projectFiles: {
    type: String,
    alias: 'f',
  },
});

export const transform = (projectFiles: string) => {
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

  const sourceFiles = project.getSourceFiles(projectFiles);

  sourceFiles.forEach((sourceFile) => {
    sourceFile.getDescendantsOfKind(SyntaxKind.EnumDeclaration).forEach((enumDeclaration) => {
      const enumMembers = enumDeclaration.getMembers();
      const isStringEnum = enumMembers.every((enumMember) =>
        enumMember.getInitializer()?.isKind(SyntaxKind.StringLiteral),
      );

      if (isStringEnum) {
        const varMeta: VarMeta = {
          name: enumDeclaration.getName(),
          object: createObjectFromEnum(enumDeclaration),
        };

        const objectLiteralExpression = createObjectLiteralExpression(varMeta.object);
        const variableStatement = createVariableStatement(varMeta.name, objectLiteralExpression);

        const enumIndex = enumDeclaration.getChildIndex();

        enumDeclaration.remove();

        // https://github.com/dsherret/ts-morph/issues/1192
        sourceFile.insertStatements(enumIndex, printNode(variableStatement));

        const typeAliasDeclaration = createTypeAliasDeclaration(varMeta.name);

        // https://github.com/dsherret/ts-morph/issues/1192
        sourceFile.insertStatements(enumIndex + 1, '\n' + printNode(typeAliasDeclaration));
      }
    });
  });

  return project.save();
};

if (parsed.flags.projectFiles) {
  void transform(parsed.flags.projectFiles);
} else {
  console.log('provide --project-files option');
}

// transform('./test/test-project/**/*.{tsx,ts}');
