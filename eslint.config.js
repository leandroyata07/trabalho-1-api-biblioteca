import js from "@eslint/js";

export default [
  {
    ignores: [
      "src/generated/**",
      "node_modules/**",
      "prisma/migrations/**",
    ],
  },
  js.configs.recommended,
];