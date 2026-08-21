import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "src/db/migrations/**", ".pglite/**"] },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
