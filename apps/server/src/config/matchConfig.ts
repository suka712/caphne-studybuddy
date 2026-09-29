export const matchConfig = {
  adminEmail: "khiemnguyen.hye@gmail.com",
  swipesPerDay: 15,
  initialMatch: 3,
  // Compatibility weights (sum to 1) used to rank the daily batch.
  weights: {
    goals: 0.3,
    interests: 0.3,
    vibes: 0.2,
    major: 0.1,
    year: 0.1,
  },
  // ±fraction of noise applied to the score when ranking (0 = deterministic).
  rankJitter: 0.25,
} as const;
// s