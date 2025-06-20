import baseConfig from '@loyalty-system/eslint-config/base';
import reactConfig from '@loyalty-system/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [
      '**/build/',
      '**/dist/',
      '**/public/',
      '**/coverage/',
      '**/node_modules/',
      '*.config.js',
      '**/eslint.config.mjs',
      '**/.prettierrc.js',
      '**/patches/',
      '**/coverage-unit/',
      '**/coverage-e2e/',
      '**/unit-results/',
      '**/e2e-results/',
    ],
  },
  ...baseConfig,
  ...reactConfig,
  {
    rules: {
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@loyalty-system/shared-universal/*'],
              message: 'Import from the main package entry point instead',
            },
            {
              group: ['@loyalty-system/react-web-ui-shadcn/*'],
              message: 'Import from the main package entry point instead',
            },
            {
              group: ['@loyalty-system/shared-web/*'],
              message: 'Import from the main package entry point instead',
            },
          ],
        },
      ],
    },
  },
];
