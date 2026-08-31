const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  { ignores: [".next/**", "coverage/**", "node_modules/**", "eslint.config.js"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
