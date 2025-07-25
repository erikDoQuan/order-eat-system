import type { Config } from 'tailwindcss';
import tailwindcssTypography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';
import { transitionProperty } from 'tailwindcss/defaultTheme';

const customTransitionProperty = Object.fromEntries(Object.entries(transitionProperty));

export default {
  content: ['src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  corePlugins: {
    preflight: true,
  },
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '0.938rem',
      },
    },
    extend: {
      // https://nekocalc.com/px-to-rem-converter
      fontSize: {
        none: ['0', '0'],
        hero: ['3.5rem', { lineHeight: '4rem', letterSpacing: '0' }],
        h1: ['4rem', { lineHeight: '5rem', letterSpacing: '0' }], //64/80
        h2: ['3rem', { lineHeight: '3.5rem', letterSpacing: '0' }], //48/56
        h3: ['2.25rem', { lineHeight: '3rem', letterSpacing: '0' }], //36/48
        h4: ['1.875rem', { lineHeight: '2.5rem', letterSpacing: '0' }], //30/40
        h5: ['1.5rem', { lineHeight: '2rem', letterSpacing: '0' }], //24/32
        h6: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0' }], //20/28
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }], // 16/24
        base2: ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0' }], // 14/22
        caption: ['0.625rem', { lineHeight: '1rem', letterSpacing: '0' }], // 10/16
      },
      colors: {
        // https://www.tailwindshades.com/
        primary: {
          50: '#eff5ff',
          100: '#dbe8fe',
          200: '#bfd7fe',
          300: '#93bbfd',
          400: '#609afa',
          500: '#3b82f6',
          600: '#2570eb',
          700: '#1d64d8',
          800: '#1e55af',
          900: '#1e478a',
          950: '#172e54',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          50: '#fdfbf6',
          100: '#fbf7ed',
          200: '#f5ead3',
          300: '#eedeb8',
          400: '#e2c583',
          500: '#d5ac4e',
          600: '#c09b46',
          700: '#a0813b',
          800: '#80672f',
          900: '#685426',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      letterSpacing: {
        4: '0.04em', // -4%
        3: '0.03em', // -3%
        2: '0.02em', // -2%
        1: '0.01em', // -1%
      },
      lineHeight: {
        0: '0',
      },
      borderWidth: {
        3: '3px',
        5: '5px',
        6: '6px',
        7: '7px',
      },
      borderRadius: {
        xl: `calc(var(--radius) + 4px)`,
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-45deg': 'linear-gradient(45deg, var(--tw-gradient-stops))',
      },
      transitionProperty: {
        ...customTransitionProperty,
        background: 'background',
        width: 'width',
        height: 'height',
        top: 'top',
        border: 'border',
        spacing: 'margin, padding',
      },
      transitionDuration: {
        0: '0ms',
        1500: '1500ms',
        2000: '2000ms',
      },
      transitionTimingFunction: {
        // https://cubic-bezier.com/
        'in-out': 'cubic-bezier(.68,.12,.38,.87)',
        'in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      animation: {
        'h-line': 'hLine 200ms ease-in-out infinite',
        'zoom-in': 'zoomIn 6s',
        'zoom-out': 'zoomOut 6s',
        'accordion-down': 'accordion-down 0.3s ease-out',
        'accordion-up': 'accordion-up 0.3s ease-out',
        'collapsible-down': 'collapsible-down 0.3s ease-out',
        'collapsible-up': 'collapsible-up 0.3s ease-out',
        gradient: 'gradient 15s ease infinite',
      },
      keyframes: {
        hLine: {
          '0%': { width: '0px' },
          '100%': { width: '100%' },
        },
        zoomIn: {
          '0%': { transform: 'translateY(0) scale(1, 1)' },
          '100%': { transform: 'translateY(-20px) scale(1.3, 1.3)' },
        },
        zoomOut: {
          '0%': { transform: 'translateY(-20px) scale(1.3, 1.3)' },
          '100%': { transform: 'translateY(0) scale(1, 1)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typography: (theme: (param: string) => any) => ({
        DEFAULT: {
          css: {
            lineHeight: theme('lineHeight.normal'),
            maxWidth: theme('maxWidth.full'),
            color: 'hsl(var(--foreground))',
            a: {
              color: theme('colors.blue[500]'),
            },
            h2: {
              marginTop: theme('spacing.5'),
              marginBottom: theme('spacing.3'),
            },
            h3: {
              marginTop: theme('spacing.4'),
            },
            ol: {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.3'),
            },
            ul: {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.3'),
            },
            li: {
              marginTop: theme('spacing.1'),
              marginBottom: theme('spacing.1'),
            },
            p: {
              marginTop: theme('spacing.0'),
              marginBottom: theme('spacing.2'),
            },
            figure: {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.2'),
            },
            video: {
              marginTop: 0,
              marginBottom: 0,
            },
          },
        },
      }),
    },
  },
  plugins: [animate, tailwindcssTypography],
} satisfies Config;
