import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cbf: {
          navy: '#1e2a3a',
          'navy-light': '#253547',
          'navy-dark': '#151f2d',
          green: '#009c3b',
          'green-light': '#00b845',
          'green-dark': '#007a2f',
          gold: '#FFDF00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
