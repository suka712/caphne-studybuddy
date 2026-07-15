import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, profiles } from "../schema.js";
import { env } from "../../config/env.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Quinn",
  "Avery",
  "Jamie",
  "Drew",
  "Skyler",
  "Reese",
  "Dakota",
  "Cameron",
  "Hayden",
  "Emery",
  "Rowan",
  "Sage",
  "Finley",
  "Harper",
  "Kai",
  "Luna",
  "Milo",
  "Nova",
  "Oliver",
  "Zara",
  "Leo",
  "Iris",
  "Theo",
  "Cleo",
  "Nico",
  "Aria",
  "Soren",
  "Freya",
  "Ezra",
  "Wren",
  "Jasper",
  "Ivy",
  "Felix",
  "Ada",
  "Oscar",
  "Ruby",
  "Hugo",
  "Stella",
  "Miles",
  "Vera",
  "Liam",
  "Elena",
  "Caleb",
  "Maya",
];

const lastNames = [
  "Nguyen",
  "Smith",
  "Park",
  "Chen",
  "Kim",
  "Patel",
  "Garcia",
  "Müller",
  "Tanaka",
  "Williams",
  "Lee",
  "Brown",
  "Santos",
  "Johnson",
  "Suzuki",
  "Martinez",
  "Li",
  "Anderson",
  "Wang",
  "Taylor",
  "Thompson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
];

const majors = [
  "Computer Science",
  "Electrical Engineering",
  "Mathematics",
  "Physics",
  "Data Science",
  "Mechanical Engineering",
  "Biology",
  "Chemistry",
  "Psychology",
  "Business Administration",
  "Economics",
  "English Literature",
  "Graphic Design",
  "Philosophy",
  "Political Science",
  "Nursing",
  "Civil Engineering",
  "Environmental Science",
  "Music",
  "Architecture",
];

const years = ["year-1", "year-2", "year-3", "year-4", "alumni"];
const genders = ["male", "female", "other"];

// Wikimedia Commons headshots, used as placeholder avatars for local dev only.
const femalePhotoUrls = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Jang_Won-young_at_the_Bulgari_Eclettica_event_in_Seoul%2C_May_12%2C_2026_%281%29.png/500px-Jang_Won-young_at_the_Bulgari_Eclettica_event_in_Seoul%2C_May_12%2C_2026_%281%29.png",
  "https://upload.wikimedia.org/wikipedia/commons/f/f0/IVE_Yujin_2026_GDA.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ive%27s_Rei_%40_OPENING_PROJECTxSATUR_PhotoCall%2C_12_June_2025_01.png/500px-Ive%27s_Rei_%40_OPENING_PROJECTxSATUR_PhotoCall%2C_12_June_2025_01.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Liz_of_Ive_at_K-SWISS_Flagship_Store_Open_Event%2C_May_7%2C_2026_%281%29.png/500px-Liz_of_Ive_at_K-SWISS_Flagship_Store_Open_Event%2C_May_7%2C_2026_%281%29.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Gaeul_of_Ive_at_Senka_Pop-up_Event%2C_May_19%2C_2026_%281%29.png/500px-Gaeul_of_Ive_at_Senka_Pop-up_Event%2C_May_19%2C_2026_%281%29.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Leeseo_of_Ive%2C_March_19%2C_2026_%283%29.png/500px-Leeseo_of_Ive%2C_March_19%2C_2026_%283%29.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Karina_at_Gimpo_Airport_on_April_22%2C_2026_03.png/500px-Karina_at_Gimpo_Airport_on_April_22%2C_2026_03.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Winter_at_Incheon_Airport_on_July_10%2C_2026.png/500px-Winter_at_Incheon_Airport_on_July_10%2C_2026.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Giselle_at_Incheon_Airport_on_March_4%2C_2026.jpg/500px-Giselle_at_Incheon_Airport_on_March_4%2C_2026.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Ningning_at_Mise-en-Scene_event_on_19022026_%282%29.png/500px-Ningning_at_Mise-en-Scene_event_on_19022026_%282%29.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/20260110_Le_Sserafim%27s_Sakura_Miyawaki_01.png/500px-20260110_Le_Sserafim%27s_Sakura_Miyawaki_01.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Kazuha_of_Le_Sserafim%2C_April_5%2C_2024_%282%29.png/500px-Kazuha_of_Le_Sserafim%2C_April_5%2C_2024_%282%29.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/240329_Kim_Chae-won_%281%29.jpg/500px-240329_Kim_Chae-won_%281%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Huh_Yunjin_of_Le_Sserafim%2C_January_10%2C_2025.png/500px-Huh_Yunjin_of_Le_Sserafim%2C_January_10%2C_2025.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/221013_Hong_Eun_Chae_%28LE_SSERAFIM%29_Airport_Departure.jpg/500px-221013_Hong_Eun_Chae_%28LE_SSERAFIM%29_Airport_Departure.jpg",
];

const goalOptions = [
  "study-buddy",
  "project-teammate",
  "accountability-partner",
  "tutor",
  "mentorship",
];
const vibeOptions = [
  "introvert",
  "extrovert",
  "night-owl",
  "early-bird",
  "chill",
  "grinder",
  "creative",
];
const interestOptions = [
  "Programming",
  "Web Dev",
  "Machine Learning",
  "Mobile Dev",
  "Game Dev",
  "Music",
  "Art",
  "Sports",
  "Reading",
  "Cooking",
  "Photography",
  "Travel",
  "Hiking",
  "Gaming",
  "Film",
  "Anime",
  "Yoga",
  "Chess",
  "Podcasts",
  "Writing",
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const pickN = <T>(arr: T[], min: number, max: number): T[] => {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const SEED_COUNT = 50;

async function seed() {
  if (env.nodeEnv !== "DEVELOPMENT") {
    throw new Error("CAN ONLY SEED DEV");
  }

  console.log(`Seeding ${SEED_COUNT} users...`);

  for (let i = 0; i < SEED_COUNT; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}.${i}@fake.local`;

    const [user] = await db
      .insert(users)
      .values({ email, password: "seeded" })
      .returning();

    const gender = pick(genders);

    await db.insert(profiles).values({
      userId: user!.id,
      displayName: `${first} ${last}`,
      gender,
      photoUrl: gender === "female" ? pick(femalePhotoUrls) : null,
      year: pick(years),
      major: pick(majors),
      bio: `Hi! I'm ${first}, a ${pick(majors)} student looking for ${pick(goalOptions).replace("-", " ")}.`,
      isPublic: Math.random() > 0.3,
      goals: pickN(goalOptions, 1, 3),
      vibes: pickN(vibeOptions, 1, 3),
      interests: pickN(interestOptions, 2, 5),
    });

    process.stdout.write(".");
  }

  console.log("\nDone!");
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
