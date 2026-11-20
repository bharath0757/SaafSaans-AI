import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "out/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      sonarjs,
    },
    rules: {
      ...jsxA11y.configs.strict.rules,
      "no-console": ["warn", { allow: ["warn", "error"] }],
      complexity: ["error", 8],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-params": ["error", 4],
      "max-depth": ["error", 3],
      "no-nested-ternary": "error",
      "no-param-reassign": "error",
      eqeqeq: ["error", "always"],
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
      "sonarjs/cognitive-complexity": ["error", 12],
      "sonarjs/no-duplicate-string": "error",
      "sonarjs/no-identical-functions": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}", "src/services/**/*.{ts,tsx}"],
    rules: {
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "writable",
        require: "readonly",
        exports: "writable",
      },
    },
  },
  {
    files: ["scripts/**/*.{js,mjs,cjs}"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "sonarjs/no-duplicate-string": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
  prettier,
];

export default config;
