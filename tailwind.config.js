/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./src/**/*.{html,ts,scss}",
    "./src/**/*.component.html",  // explicit component templates
    "./src/**/*.component.ts",    // inline templates
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}