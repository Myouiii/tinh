/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}
const randomColor = Math.floor(Math.random() * 16777215).toString(16);
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'noise': "url('/images/noise.svg')",
        'love': "url('/assets/image/love.png')",
      },
      transitionProperty: {
        'width': 'width 0.1s linear',
      },
      colors: {
        'regal-blue': `#${randomColor}`,
      },
      boxShadow: {
        'lg': '0 10px 20px 2px rgba(0, 0, 0, 0.4)',
      },
      screens: {
        'laptop': '1285px',
      },
      animation: {
        'spin-slow': 'spin 9s linear infinite',
      },
      "keyframes": {
        "shimmer": {
          "100%": {
            "transform": "translateX(100%)",
          },
        },
      }

    },
  },
  plugins: [
    require('@headlessui/tailwindcss')({ prefix: 'ui' })
  ],
  safelist: [
    {
      pattern: /shadow-/,
      variants: ['group-hover'],
    }
  ],

}