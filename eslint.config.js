// @ts-check
const expoConfig = require("eslint-config-expo/flat");
const { defineConfig, globalIgnores } = require("eslint/config");

module.exports = defineConfig([
  globalIgnores([
    "node_modules/**",
    "dist/**",
    ".expo/**",
    "ios/**",
    "android/**",
    "*.config.js",
  ]),
  expoConfig,
  {
    rules: {
      // Add any custom rules here
    },
  },
]);
