import fs from 'node:fs/promises';
import path from 'node:path';

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
    let isHelperImported = false;
    const enumDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.EnumDeclaration);

    for (const enumDeclaration of enumDeclarations) {
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

        if (config.helperDir) {
          if (!isHelperImported) {
            const relativePath = path.relative(path.dirname(sourceFile.getFilePath()), path.resolve(config.helperDir));
            const importPath = relativePath ? `./${relativePath}/${helperBaseFileName}` : `./${helperBaseFileName}`;
            const importDeclaration = createImportDeclaration(importPath);

            const importDeclarations = sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration);
            const lastImportIndex = importDeclarations[importDeclarations.length - 1].getChildIndex();
            sourceFile.insertStatements(lastImportIndex + 1, printNode(importDeclaration));
            isHelperImported = true;
          }

          sourceFile.insertStatements(enumIndex + 1, printNode(variableStatement));

          const typeAliasDeclaration = createTypeAliasDeclarationWithHelper(varMeta.name);
          sourceFile.insertStatements(enumIndex + 2,  printNode(typeAliasDeclaration));
        } else {
          sourceFile.insertStatements(enumIndex, printNode(variableStatement));

          const typeAliasDeclaration = createTypeAliasDeclaration(varMeta.name);
          sourceFile.insertStatements(enumIndex + 1, printNode(typeAliasDeclaration));
        }
        enumDeclaration.remove();
      }
    }
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
