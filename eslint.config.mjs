import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow 'any' for ROS message handling
      "@typescript-eslint/no-explicit-any": "warn", // Changed from error to warning
      
      // Stricter rules for code quality
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-const": "error",
      "no-console": "warn",
      
      // React specific
      "react-hooks/exhaustive-deps": "warn",
    }
  }
];

export default eslintConfig;
