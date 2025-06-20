/// <reference types="node" />
import { defineConfig } from 'tsup';

export default defineConfig({
  watch: process.env.DEV === 'true',
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,
  skipNodeModulesBundle: true,
});
