/// <reference types="node" />
import fs from 'fs';
import path from 'path';
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
  esbuildOptions: options => {
    // External CSS/SCSS modules
    options.loader = {
      ...options.loader,
      '.css': 'empty',
      '.scss': 'empty',
    };
  },
  // Copy SCSS files to dist after build
  async onSuccess() {
    // Create styles directory in dist
    const stylesDir = path.join('dist', 'styles');
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    // Copy the CK Editor SCSS file
    try {
      const srcDir = path.join('src', 'components', 'editors');
      const destDir = path.join('dist', 'components', 'editors');

      // Create destination directory
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy the file
      fs.copyFileSync(path.join(srcDir, 'ck-editor.scss'), path.join(destDir, 'ck-editor.scss'));

      console.log('Successfully copied SCSS files to dist');
    } catch (error) {
      console.error('Error copying SCSS files:', error);
    }
  },
});
