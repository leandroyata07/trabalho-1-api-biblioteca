import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["src/generated/**", "node_modules/**", "prisma/migrations/**", "frontend/dist/**"] },
  {
    files: ["src/**/*.js"],
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.node, fetch: "readonly" } },
  },
  {
    files: ["frontend/**/*.js", "frontend/**/*.jsx"],
    ...js.configs.recommended,
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
