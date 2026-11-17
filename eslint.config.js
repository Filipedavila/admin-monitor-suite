import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist/**",
    "coverage/**",
    "node_modules/**",
    ".claude/**",
    "Monitor-server-v2/**",
  ]),
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,jsx}"], languageOptions: { globals: globals.browser } },
  pluginReact.configs.flat.recommended,
  // React 17+ JSX runtime: React não precisa de estar em escopo no JSX.
  pluginReact.configs.flat["jsx-runtime"],
  { settings: { react: { version: "detect" } } },
  {
    rules: {
      // O projeto não usa PropTypes (JS sem tipos); a validação de props fica para uma futura migração.
      "react/prop-types": "off",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["*.config.js", "vite.config.js", "vitest.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.test.{js,jsx}", "src/tests/**/*.{js,jsx}"],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } },
  },
]);
