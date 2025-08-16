import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
    },
    rules: {
      // TypeScript Standard Style rules (compatible with current version)
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/ban-tslint-comment": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "allow",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-empty-interface": [
        "error",
        { allowSingleExtends: true },
      ],
      "@typescript-eslint/no-extra-non-null-assertion": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-this-alias": [
        "error",
        { allowDestructuring: true },
      ],
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/triple-slash-reference": [
        "error",
        { lib: "never", path: "never", types: "prefer-import" },
      ],

      // Naming conventions (relaxed for React components and constants)
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variableLike",
          format: ["camelCase", "PascalCase", "UPPER_CASE"], // Allow constants too
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"], // Allow PascalCase for React components
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: false,
          },
        },
      ],

      // Type-aware rules (requires TypeScript project)
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": "off", // Too strict for React event handlers
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-implied-eval": "error",
      "@typescript-eslint/no-misused-promises": "off", // Too strict for React event handlers
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { 
          allowNumber: true, 
          allowBoolean: true, 
          allowAny: true, // Allow any for ROS messages
          allowNullish: true 
        },
      ],
      "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],

      // Relaxed rules for ROS and React development
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-unsafe-assignment": "off", // ROS messages can be dynamic
      "@typescript-eslint/no-unsafe-member-access": "off", // ROS messages can be dynamic
      "@typescript-eslint/no-unsafe-call": "off", // ROS libraries may not have perfect types
      "@typescript-eslint/no-unsafe-argument": "off", // ROS integration flexibility
      "@typescript-eslint/no-unsafe-return": "off", // ROS integration flexibility
      
      // Standard JavaScript rules
      "prefer-const": "error",
      "no-console": "warn",
      "no-var": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-spread": "error",
      "prefer-rest-params": "error",
      "no-useless-constructor": "error",
      "no-duplicate-imports": "error",
      
      // Code style
      "comma-dangle": ["error", "always-multiline"],
      "quotes": ["error", "single", { avoidEscape: true }],
      "semi": ["error", "always"],
      "indent": ["error", 2, { SwitchCase: 1 }],
      "no-tabs": "error",
      "no-trailing-spaces": "error",
      "max-len": [
        "error",
        {
          "code": 100,
          "tabWidth": 2,
          "ignoreUrls": true,
          "ignoreStrings": true,
          "ignoreTemplateLiterals": true,
          "ignoreRegExpLiterals": true,
          "ignoreComments": false
        }
      ],
      
      // React specific
      "react-hooks/exhaustive-deps": "warn",
      
      // JSX prop ordering
      "react/jsx-sort-props": [
        "error",
        {
          "callbacksLast": false,
          "shorthandFirst": false,
          "shorthandLast": false,
          "multiline": "last",
          "ignoreCase": true,
          "noSortAlphabetically": false,
          "reservedFirst": ["key"],
          "locale": "en"
        }
      ],
    }
  }
];

export default eslintConfig;
