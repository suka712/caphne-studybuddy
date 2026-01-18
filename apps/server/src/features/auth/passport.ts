import passport from "passport";
import { googleStrategy } from "./strategies/google.strategy.js";
import { githubStrategy } from "./strategies/github.strategy.js";

passport.use(googleStrategy)
passport.use(githubStrategy)

export { passport }