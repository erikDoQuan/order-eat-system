import nestjsConfig from '@loyalty-system/eslint-config/nestjs';

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['**/build/', '**/dist/', '**/public/', '**/coverage/', '**/node_modules/', '*.config.js', '**/eslint.config.mjs', '**/.prettierrc.js'],
  },
  ...nestjsConfig,
];
