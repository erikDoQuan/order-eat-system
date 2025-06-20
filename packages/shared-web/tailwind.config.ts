import type { Config } from 'tailwindcss';

import sharedConfig from '@loyalty-system/tailwind-config/web';

const config: Pick<Config, 'presets' | 'content'> = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [sharedConfig],
};

export default config;
