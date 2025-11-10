import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1300px',
        '2xl': '1536px',
      },
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray.700'),
            '--tw-prose-headings': theme('colors.gray.900'),
            '--tw-prose-links': theme('colors.purple.600'),
            '--tw-prose-code': theme('colors.purple.600'),
            '--tw-prose-pre-bg': theme('colors.gray.50'),
            '--tw-prose-pre-code': theme('colors.gray.800'),
            '--tw-prose-invert-body': theme('colors.gray.300'),
            '--tw-prose-invert-headings': theme('colors.gray.100'),
            '--tw-prose-invert-links': theme('colors.purple.400'),
            '--tw-prose-invert-code': theme('colors.purple.400'),
            '--tw-prose-invert-pre-bg': theme('colors.gray.800'),
            '--tw-prose-invert-pre-code': theme('colors.gray.200'),
            maxWidth: 'none',
            color: 'var(--tw-prose-body)',
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            code: {
              color: 'var(--tw-prose-code)',
              backgroundColor: theme('colors.gray.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: 'transparent',
              padding: 0,
              margin: 0,
              fontSize: '0.875em',
              lineHeight: '1.7142857',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: 0,
              fontWeight: '400',
              color: 'var(--tw-prose-pre-code)',
            },
            h1: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '800',
              fontSize: '2.25em',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
              fontSize: '1.5em',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
              fontSize: '1.25em',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'normal',
              color: 'var(--tw-prose-body)',
              borderLeftWidth: '4px',
              borderLeftColor: theme('colors.purple.500'),
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              backgroundColor: theme('colors.purple.50'),
              padding: '1rem',
              borderRadius: '0.5rem',
            },
            ul: {
              listStyleType: 'disc',
            },
            ol: {
              listStyleType: 'decimal',
            },
            'ul > li::marker': {
              color: theme('colors.purple.500'),
            },
            'ol > li::marker': {
              color: theme('colors.purple.500'),
            },
            table: {
              width: '100%',
              tableLayout: 'auto',
              textAlign: 'left',
              fontSize: '0.875em',
            },
            thead: {
              borderBottomWidth: '2px',
              borderBottomColor: theme('colors.gray.300'),
            },
            'thead th': {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
              verticalAlign: 'bottom',
              paddingRight: '0.5714286em',
              paddingBottom: '0.5714286em',
              paddingLeft: '0.5714286em',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: theme('colors.gray.200'),
            },
            'tbody td': {
              verticalAlign: 'baseline',
              padding: '0.5714286em',
            },
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: theme('colors.gray.800'),
            },
            blockquote: {
              backgroundColor: theme('colors.purple.900/20'),
              borderLeftColor: theme('colors.purple.400'),
            },
            'thead th': {
              borderBottomColor: theme('colors.gray.700'),
            },
            'tbody tr': {
              borderBottomColor: theme('colors.gray.800'),
            },
          },
        },
      }),
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
