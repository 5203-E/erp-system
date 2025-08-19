/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // 可以在这里添加自定义颜色
      },
      fontFamily: {
        // 可以在这里添加自定义字体
      },
      spacing: {
        // 可以在这里添加自定义间距
      }
    },
  },
  plugins: [],
}
