/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    cssnano: {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true, // Remove all comments
          },
          normalizeWhitespace: true, // Remove unnecessary whitespace
          colormin: true, // Optimize color values
          discardDuplicates: true, // Remove duplicate rules
          minifySelectors: true, // Minify selectors
          minifyParams: true, // Minify @rule parameters
          minifyGradients: true, // Minify gradient definitions
          minifyFontValues: true, // Minify font values
          normalizeUrl: true, // Normalize URLs
          mergeLonghand: true, // Merge longhand properties into shorthand
          mergeRules: true, // Merge adjacent rules
        },
      ],
    },
  },
};

export default config;
