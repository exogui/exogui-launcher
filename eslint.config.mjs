// @ts-check

import eslint from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from 'globals';
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "website/**", "build/**", "extern/**", "extensions/**", "./**.mjs", "./**.js"]
  },
  {
    files: ["src/**/*"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [{
          "group": ["flashpoint-launcher-renderer-ext/*"],
          "allowTypeImports": true,
          "message": "This module is only available in extensions, use Launcher src imports instead.",
        }]
      }]
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react
    },
    settings: {
      react: {
        version: "17"
      }
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
          ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/adjacent-overload-signatures": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@stylistic/indent": ["error", 2, {
        "MemberExpression": 0,
        "SwitchCase": 1
      }],
      "@typescript-eslint/no-empty-function": ["error", { "allow": ["arrowFunctions"] }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-invalid-void-type": ["error", { "allowInGenericTypeArguments": true }],
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        "vars": "all",
        "caughtErrors": "none",
        "args": "none"
      }],
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/prefer-interface": "off",
      //"react/no-access-state-in-setstate": "error", (requires restructuring of "app.tsx")
      "react/no-direct-mutation-state": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-unescaped-entities": ["error", {
        "forbid": [{
          "char": ">",
          "alternatives": ["&gt;"]
        }, {
          "char": "}",
          "alternatives": ["&#125;"]
        }]
      }],
      "react/no-unused-prop-types": "error",
      "react/no-unused-state": "error",
      "@typescript-eslint/no-redeclare": "error",
      "for-direction": "warn",
      "getter-return": "warn",
      "keyword-spacing": "warn",
      "no-compare-neg-zero": "warn",
      "no-cond-assign": "warn",
      "no-constant-condition": ["warn", { checkLoops: false }],
      "no-debugger": "warn",
      "no-delete-var": "warn",
      "no-dupe-args": "warn",
      "no-dupe-keys": "warn",
      "no-duplicate-case": "warn",
      "no-empty": "warn",
      "no-empty-character-class": "warn",
      "no-empty-pattern": "warn",
      "no-ex-assign": "warn",
      "no-extra-boolean-cast": "warn",
      "no-extra-semi": "warn",
      "no-func-assign": "warn",
      "no-global-assign": "warn",
      "no-invalid-regexp": "warn",
      "no-irregular-whitespace": "warn",
      "no-mixed-spaces-and-tabs": "warn",
      "no-obj-calls": "warn",
      "no-octal": "warn",
      "no-prototype-builtins": "warn",
      "no-redeclare": "warn",
      "no-regex-spaces": "warn",
      "no-self-assign": "warn",
      "no-shadow-restricted-names": "warn",
      "no-spaced-func": "warn",
      "no-sparse-arrays": "warn",
      "no-trailing-spaces": "warn",
      "no-unexpected-multiline": "warn",
      "no-unreachable": "warn",
      "no-unsafe-finally": "warn",
      "no-unsafe-negation": "warn",
      "no-unused-labels": "warn",
      "no-useless-catch": "warn",
      "no-useless-escape": "warn",
      "no-whitespace-before-property": "warn",
      "no-with": "warn",
      // "require-atomic-updates": "warn", // (requires restructuring of "recursiveDirectory()")
      "semi": ["warn", "always"],
      "space-before-blocks": "warn",
      "space-unary-ops": "warn",
      "spaced-comment": "warn",
      "use-isnan": "warn",
      "valid-typeof": "warn",
      "wrap-iife": "warn",
      "yoda": "warn"
    }
  },
  reactHooks.configs.flat["recommended-latest"],
);
