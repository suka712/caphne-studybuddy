// One-off backfill for the profileOptions.ts redesign (goals/vibes/interests).
// Safe by default: prints a diff and does nothing. Pass --apply to actually write.
//
// Usage:
//   export DATABASE_URL=$(aws ssm get-parameter --name /caphne/prod/DATABASE_URL --with-decryption --query Parameter.Value --output text)
//   pnpm --filter server exec tsx src/db/scripts/backfill-profile-options.ts            # dry run
//   pnpm --filter server exec tsx src/db/scripts/backfill-profile-options.ts --apply    # writes changes
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { profiles } from "../schema.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Pure renames (same concept, new wording) + best-effort maps for values that
// no longer have a clean equivalent (agreed: force onto the nearest new tag
// rather than silently drop). One entry maps to multiple new tags where a
// single old value was split into two new ones (Thesis/Capstone).
const goalsMap: Record<string, string[]> = {
  "learn-new": ["skill-exchange"],
  "sports-buddy": ["fitness-buddy"],
  "meet-people": ["campus-friends"],
  "share-skills": ["skill-exchange"],
};

const vibesMap: Record<string, string[]> = {
  Introvert: ["Silent focus"],
  Extrovert: ["Talk it out"],
  Grinder: ["Grind"],
};

const interestsMap: Record<string, string[]> = {
  "Design/UI": ["UI/UX design"],
  "Coffee/hangouts": ["Café hangouts"],
  LinkedIn: ["Career fairs"],
  Networking: ["E-commerce"],
  Reading: ["Café hangouts"],
  "Thesis/Capstone": ["Thesis", "Capstone project"],
};

function remap(values: string[], map: Record<string, string[]>): string[] {
  const out = values.flatMap((v) => map[v] ?? [v]);
  return Array.from(new Set(out));
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

async function main() {
  const apply = process.argv.includes("--apply");

  const rows = await db
    .select({
      id: profiles.id,
      goals: profiles.goals,
      vibes: profiles.vibes,
      interests: profiles.interests,
    })
    .from(profiles);

  console.log(`Loaded ${rows.length} profiles.`);

  const changes: {
    id: number;
    before: { goals: string[]; vibes: string[]; interests: string[] };
    after: { goals: string[]; vibes: string[]; interests: string[] };
  }[] = [];

  for (const row of rows) {
    const newGoals = remap(row.goals, goalsMap);
    const newVibes = remap(row.vibes, vibesMap);
    const newInterests = remap(row.interests, interestsMap);

    const changed =
      !arraysEqual(row.goals, newGoals) ||
      !arraysEqual(row.vibes, newVibes) ||
      !arraysEqual(row.interests, newInterests);

    if (changed) {
      changes.push({
        id: row.id,
        before: { goals: row.goals, vibes: row.vibes, interests: row.interests },
        after: { goals: newGoals, vibes: newVibes, interests: newInterests },
      });
    }
  }

  console.log(`${changes.length} profile(s) need updates.\n`);

  const sample = changes.slice(0, 10);
  for (const c of sample) {
    console.log(`profile #${c.id}`);
    if (!arraysEqual(c.before.goals, c.after.goals)) {
      console.log(`  goals:     ${JSON.stringify(c.before.goals)} -> ${JSON.stringify(c.after.goals)}`);
    }
    if (!arraysEqual(c.before.vibes, c.after.vibes)) {
      console.log(`  vibes:     ${JSON.stringify(c.before.vibes)} -> ${JSON.stringify(c.after.vibes)}`);
    }
    if (!arraysEqual(c.before.interests, c.after.interests)) {
      console.log(`  interests: ${JSON.stringify(c.before.interests)} -> ${JSON.stringify(c.after.interests)}`);
    }
  }
  if (changes.length > sample.length) {
    console.log(`... and ${changes.length - sample.length} more.`);
  }

  if (!apply) {
    console.log("\nDry run only — no writes made. Re-run with --apply to write these changes.");
    await pool.end();
    return;
  }

  console.log("\nApplying...");
  await db.transaction(async (tx) => {
    for (const c of changes) {
      await tx
        .update(profiles)
        .set({ goals: c.after.goals, vibes: c.after.vibes, interests: c.after.interests })
        .where(eq(profiles.id, c.id));
    }
  });
  console.log(`Updated ${changes.length} profile(s).`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
