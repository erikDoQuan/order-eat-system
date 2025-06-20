/// <reference types="./types.d.ts" />

import * as path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import turboPlugin from 'eslint-plugin-turbo';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore files not tracked by VCS and any config files
  includeIgnoreFile(path.join(import.meta.dirname, '../../.gitignore')),
  { ignores: ['**/*.config.*'] },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      eslintPluginPrettierRecommended,
    ],
    rules: {
      ...turboPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-misused-promises': [2, { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-unnecessary-condition': [
        'warn',
        {
          allowConstantLoopConditions: true,
        },
      ],
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'off',

      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'warn',

      // these rules should be enabled once we have a proper type system
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/class-literal-property-style': 'warn',
      '@typescript-eslint/prefer-regexp-exec': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: {
      parserOptions: { projectService: true },
      parser: tseslint.parser,
      globals: {
        ...globals.builtin,
        ...globals.es2024,
      },
    },
  },
);
