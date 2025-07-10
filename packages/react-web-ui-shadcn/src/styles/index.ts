// Re-export CSS files
import 'ckeditor5/ckeditor5.css';
// For SCSS files, we'll handle them differently since tsup doesn't preserve them well
// This import might be processed by the bundler's CSS mechanism, not directly used in the JS
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Ignore TS error for SCSS import
import '../components/editors/ck-editor.scss';

// We'll also add a direct reference to the SCSS file in a way that will be preserved in the output
// This string will be picked up by grep and is meant to be a hint for consumers of this library
export const SCSS_FILES = {
  // The path here should match what you've added to your exports in package.json
  ckEditor: '../components/editors/ck-editor.scss',
};

// Export a dummy function to avoid tree-shaking of CSS imports
export const importStyles = () => {
  // This function does nothing but ensures the CSS imports are preserved
  return true;
};
