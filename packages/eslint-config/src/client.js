import { createConfigForNuxt } from "@nuxt/eslint-config";
import base from "./base.js";

export default createConfigForNuxt().prepend(...base);
