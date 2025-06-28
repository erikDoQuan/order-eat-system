import type { Config } from 'tailwindcss';

import sharedConfig from '@loyalty-system/tailwind-config/web';

const customConfig: Pick<Config, 'content' | 'presets' | 'theme'> = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/react-web-ui-shadcn/src/**/*.{ts,tsx}',
    '../../packages/shared-web/src/**/*.{ts,tsx}',
    '../../packages/shared-universal/src/**/*.{ts,tsx}',
  ],
  presets: [sharedConfig],
  theme: {
    fontFamily: {
      notosans: ['"Noto Sans"'],
    },
    extend: {
      colors: {
        primary: '#006A31',
      },
      keyframes: {
        tilt: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
      },
      animation: {
        tilt: 'tilt 0.4s ease-in-out',
      },
    },
  },
};

export default customConfig;
