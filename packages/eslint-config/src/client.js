import { createConfigForNuxt } from "@nuxt/eslint-config";
import base from "./base.js";

export default createConfigForNuxt()
  .prepend(...base)
  .append({
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  });
