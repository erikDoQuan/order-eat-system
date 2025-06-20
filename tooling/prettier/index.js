import { fileURLToPath } from 'node:url';

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  arrowParens: 'avoid',
  singleQuote: true,
  bracketSpacing: true,
  bracketSameLine: false,
  printWidth: 150,
  useTabs: false,
  semi: true,
  tabWidth: 2,
  proseWrap: 'always',

  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],

  tailwindFunctions: ['cn', 'cva'],
  tailwindConfig: fileURLToPath(new URL('../../tooling/tailwindcss/web.ts', import.meta.url)),

  importOrder: [
    '<TYPES>',
    '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
    '^(next/(.*)$)|^(next$)',
    '^(expo(.*)$)|^(expo$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '<TYPES>^@loyalty-system',
    '^@loyalty-system/(.*)$',
    '',
    '<TYPES>^[.|..|~]',
    '^~/',
    '^[../]',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '4.4.0',
  overrides: [
    {
      files: '*.json.hbs',
      options: {
        parser: 'json',
      },
    },
    {
      files: '*.js.hbs',
      options: {
        parser: 'babel',
      },
    },
  ],
};

export default config;
