// /** @type {import('tailwindcss').Config} */
// /* eslint-disable max-len */
// module.exports = {
//   content: [
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     transparent: "transparent",
//     current: "currentColor",
//     extend: {
//       colors: {
//         'azul-previley':'#213A8E',
//         // light mode
//         tremor: {
//           brand: {
//             faint: "#eff6ff", // blue-50
//             muted: "#bfdbfe", // blue-200
//             subtle: "#60a5fa", // blue-400
//             DEFAULT: "#3b82f6", // blue-500
//             emphasis: "#1d4ed8", // blue-700
//             inverted: "#ffffff", // white
//           },
//           background: {
//             muted: "#f9fafb", // gray-50
//             subtle: "#f3f4f6", // gray-100
//             DEFAULT: "#ffffff", // white
//             emphasis: "#374151", // gray-700
//           },
//           border: {
//             DEFAULT: "#e5e7eb", // gray-200
//           },
//           ring: {
//             DEFAULT: "#e5e7eb", // gray-200
//           },
//           content: {
//             subtle: "#9ca3af", // gray-400
//             DEFAULT: "#6b7280", // gray-500
//             emphasis: "#374151", // gray-700
//             strong: "#111827", // gray-900
//             inverted: "#ffffff", // white
//           },
//         },
//         // dark mode
//         "dark-tremor": {
//           brand: {
//             faint: "#0B1229", // custom
//             muted: "#172554", // blue-950
//             subtle: "#1e40af", // blue-800
//             DEFAULT: "#3b82f6", // blue-500
//             emphasis: "#60a5fa", // blue-400
//             inverted: "#030712", // gray-950
//           },
//           background: {
//             muted: "#131A2B", // custom
//             subtle: "#1f2937", // gray-800
//             DEFAULT: "#111827", // gray-900
//             emphasis: "#d1d5db", // gray-300
//           },
//           border: {
//             DEFAULT: "#1f2937", // gray-800
//           },
//           ring: {
//             DEFAULT: "#1f2937", // gray-800
//           },
//           content: {
//             subtle: "#4b5563", // gray-600
//             DEFAULT: "#6b7280", // gray-600
//             emphasis: "#e5e7eb", // gray-200
//             strong: "#f9fafb", // gray-50
//             inverted: "#000000", // black
//           },
//         },
//       },
//       boxShadow: {
//         // light
//         "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
//         "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
//         "tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
//         // dark
//         "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
//         "dark-tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
//         "dark-tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
//       },
//       borderRadius: {
//         "tremor-small": "0.375rem",
//         "tremor-default": "0.5rem",
//         "tremor-full": "9999px",
//       },
//       fontSize: {
//         "tremor-label": ["0.75rem"],
//         "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
//         "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
//         "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
//       },
//     },
//   },
//   safelist: [
//     {
//       pattern:
//         /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
//       variants: ["hover", "ui-selected"],
//     },
//     {
//       pattern:
//         /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
//       variants: ["hover", "ui-selected"],
//     },
//     {
//       pattern:
//         /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
//       variants: ["hover", "ui-selected"],
//     },
//     {
//       pattern:
//         /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
//     },
//     {
//       pattern:
//         /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
//     },
//     {
//       pattern:
//         /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
//     },
//   ],
//   plugins: [require("@headlessui/tailwindcss")],
// };


// NUEVO:
import colors from 'tailwindcss/colors';

const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',

    // Path to Tremor module
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    transparent: 'transparent',
    current: 'currentColor',
    extend: {
      colors: {
        // light mode
        tremor: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        // dark mode
        'dark-tremor': {
          brand: {
            faint: '#0B1229',
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          background: {
            muted: '#131A2B',
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },
        dashboard: {
          primary: '#425AEF',
          'primary-dark': '#2A3CC3',
          accent: '#9FAFFB',
          highlight: '#FBD6C8',
          soft: '#F5F7FF',
        },
        mora: {
          primary: '#FF3C41',
          'primary-dark': '#E03238',
          soft: '#FFE6E7',
          accent: '#FFD1D3',
          shadow: 'rgba(255, 60, 65, 0.35)',
        },
        pagex: {
          primary: '#7354FF',
          'primary-dark': '#5637D8',
          soft: '#E8E3FF',
          accent: '#BDA7FF',
          highlight: 'rgba(150, 222, 255, 0.14)',
        },
        licencias: {
          primary: '#2BB07B',
          'primary-dark': '#1C7F57',
          soft: '#DDF7ED',
          accent: '#9DE8C7',
          highlight: 'rgba(196, 244, 222, 0.22)',
        },
        badge: {
          dashboard: '#E4E9FF',
          mora: '#FFE3E5',
          pagex: '#E7E1FF',
          licencias: '#D9F3E6',
        },
        'badge-text': {
          dashboard: '#2A3CC3',
          mora: '#C8232B',
          pagex: '#5132C6',
          licencias: '#16724D',
        },
      },
      boxShadow: {
        // light
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        // dark
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        elevated: '0 30px 60px -40px rgba(33, 38, 52, 0.55)',
      },
      borderRadius: {
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
        'badge-md': '6px',
      },
      fontSize: {
        'tremor-label': ['0.75rem', { lineHeight: '1rem' }],
        'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [require('@headlessui/tailwindcss'), require('@tailwindcss/forms')],
};

export default config;
