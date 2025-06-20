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
];
