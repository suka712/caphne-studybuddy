import type { profiles } from "../../db/schema.js";
import { matchConfig } from "../../config/matchConfig.js";

type Profile = typeof profiles.$inferSelect;
export type ScorableProfile = Pick<
  Profile,
  "major" | "year" | "goals" | "vibes" | "interests"
>;

// Vibes that conflict when the two people hold opposite ends.
const OPPOSING_VIBES: [string, string][] = [
  ["Early bird", "Night owl"],
  ["In-person", "Online"],
];

const YEAR_ORDER = ["year-1", "year-2", "year-3", "year-4"];

const overlap = (a: string[], b: string[]) => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

// Overlap relative to the smaller list, so a short list that's fully covered
// still scores 1 (Jaccard would punish people who list many interests).
const overlapRatio = (a: string[], b: string[]) => {
  const min = Math.min(a.length, b.length);
  return min === 0 ? 0 : overlap(a, b).length / min;
};

const yearScore = (a: string, b: string) => {
  const i = YEAR_ORDER.indexOf(a);
  const j = YEAR_ORDER.indexOf(b);
  if (i === -1 || j === -1) return a === b ? 1 : 0;
  return Math.max(0, 1 - Math.abs(i - j) / 2); // same 1, ±1 0.5, ±2+ 0
};

const vibeScore = (a: string[], b: string[]) => {
  const conflicts = OPPOSING_VIBES.filter(
    ([x, y]) =>
      (a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x)),
  ).length;
  return Math.max(0, overlapRatio(a, b) - 0.5 * conflicts);
};

export type MatchBreakdown = {
  score: number; // 0..1
  sharedInterests: string[];
  sharedGoals: string[];
};

export const scoreCompatibility = (
  me: ScorableProfile,
  other: ScorableProfile,
): MatchBreakdown => {
  const w = matchConfig.weights;
  const sharedInterests = overlap(me.interests, other.interests);
  const sharedGoals = overlap(me.goals, other.goals);

  const score =
    w.goals * overlapRatio(me.goals, other.goals) +
    w.interests * overlapRatio(me.interests, other.interests) +
    w.vibes * vibeScore(me.vibes, other.vibes) +
    w.major * (me.major === other.major ? 1 : 0) +
    w.year * yearScore(me.year, other.year);

  return { score, sharedInterests, sharedGoals };
};

// Rank by score with a little noise, so the same top people don't appear for
// everyone every day and lower-scored users still get exposure.
export const rankCandidates = <T extends ScorableProfile & { userId: number }>(
  me: ScorableProfile,
  pool: T[],
  limit: number,
  random: () => number = Math.random,
) => {
  const jitter = matchConfig.rankJitter;
  return pool
    .map((p) => ({ p, s: scoreCompatibility(me, p).score }))
    .map(({ p, s }) => ({ p, rank: s * (1 - jitter + 2 * jitter * random()) }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map(({ p }) => p);
};
