import { defineConfig, globalIgnores } from "eslint/config";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default defineConfig(
  eslintJs.configs.recommended,
  eslintTs.configs.recommended,
  prettierConfig,
  globalIgnores(["**/dist/**", "**/node_modules/**"]),
  {
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
