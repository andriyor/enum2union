import { typeFlag } from 'type-flag';
import { Project, SyntaxKind, printNode } from 'ts-morph';

import {
  createImportDeclaration,
  createObjectFromEnum,
  createObjectLiteralExpression,
  createTypeAliasDeclaration,
  createTypeAliasDeclarationWithHelper,
  createVariableStatement,
} from './helpers';
import { Config, VarMeta } from './types';
import fs from 'node:fs/promises';
import path from 'path';

const parsed = typeFlag({
  projectFiles: {
    type: String,
    alias: 'f',
  },
  helperDir: {
    type: String,
    alias: 'h',
  },
});

const helperBaseFileName = 'object-values';

const createHelperFile = async (helperDirectory: string) => {
  const helperFileName = `${helperBaseFileName}.ts`;
  const helperCode = 'export type ObjectValues<T> = T[keyof T];';
  const helperPath = `${helperDirectory}/${helperFileName}`;
  await fs.writeFile(helperPath, helperCode);
};

export const transform = async (config: Config) => {
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
  const sourceFiles = project.getSourceFiles(config.projectFiles);

  if (config.helperDir) {
    await createHelperFile(config.helperDir);
  }

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

        if (config.helperDir) {
          const relativePath = path.relative(path.dirname(sourceFile.getFilePath()), path.resolve(config.helperDir));
          const importPath = relativePath ? `./${relativePath}/${helperBaseFileName}` : `./${helperBaseFileName}`;
          const importDeclaration = createImportDeclaration(importPath);
          sourceFile.insertStatements(0, printNode(importDeclaration));

          sourceFile.insertStatements(enumIndex + 1, '\n' + printNode(variableStatement));

          const typeAliasDeclaration = createTypeAliasDeclarationWithHelper(varMeta.name);
          sourceFile.insertStatements(enumIndex + 2, '\n' + printNode(typeAliasDeclaration));
        } else {
          sourceFile.insertStatements(enumIndex, printNode(variableStatement));

          const typeAliasDeclaration = createTypeAliasDeclaration(varMeta.name);
          sourceFile.insertStatements(enumIndex + 1, '\n' + printNode(typeAliasDeclaration));
        }
      }
    });
  });

  return project.save();
};

if (parsed.flags.projectFiles) {
  void transform({
    projectFiles: parsed.flags.projectFiles,
    helperDir: parsed.flags.helperDir,
  });
} else {
  console.log('provide --project-files option');
}

// void transform({
//   projectFiles: './test/test-project/with-helper/**/*.{tsx,ts}',
//   helperDir: './test/test-project/with-helper/types',
// });
