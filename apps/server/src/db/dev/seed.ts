import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users, profiles } from '../schema.js'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Jamie', 'Drew', 'Skyler', 'Reese', 'Dakota', 'Cameron', 'Hayden', 'Emery',
  'Rowan', 'Sage', 'Finley', 'Harper', 'Kai', 'Luna', 'Milo', 'Nova',
  'Oliver', 'Zara', 'Leo', 'Iris', 'Theo', 'Cleo', 'Nico', 'Aria',
  'Soren', 'Freya', 'Ezra', 'Wren', 'Jasper', 'Ivy', 'Felix', 'Ada',
  'Oscar', 'Ruby', 'Hugo', 'Stella', 'Miles', 'Vera', 'Liam', 'Elena',
  'Caleb', 'Maya',
]

const lastNames = [
  'Nguyen', 'Smith', 'Park', 'Chen', 'Kim', 'Patel', 'Garcia', 'Müller',
  'Tanaka', 'Williams', 'Lee', 'Brown', 'Santos', 'Johnson', 'Suzuki',
  'Martinez', 'Li', 'Anderson', 'Wang', 'Taylor', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis',
]

const majors = [
  'Computer Science', 'Electrical Engineering', 'Mathematics', 'Physics',
  'Data Science', 'Mechanical Engineering', 'Biology', 'Chemistry',
  'Psychology', 'Business Administration', 'Economics', 'English Literature',
  'Graphic Design', 'Philosophy', 'Political Science', 'Nursing',
  'Civil Engineering', 'Environmental Science', 'Music', 'Architecture',
]

const years = ['year-1', 'year-2', 'year-3', 'year-4', 'alumni']
const genders = ['male', 'female', 'other']

const goalOptions = ['study-buddy', 'project-teammate', 'accountability-partner', 'tutor', 'mentorship']
const vibeOptions = ['introvert', 'extrovert', 'night-owl', 'early-bird', 'chill', 'grinder', 'creative']
const interestOptions = [
  'Programming', 'Web Dev', 'Machine Learning', 'Mobile Dev', 'Game Dev',
  'Music', 'Art', 'Sports', 'Reading', 'Cooking', 'Photography', 'Travel',
  'Hiking', 'Gaming', 'Film', 'Anime', 'Yoga', 'Chess', 'Podcasts', 'Writing',
]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!
const pickN = <T>(arr: T[], min: number, max: number): T[] => {
  const n = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const SEED_COUNT = 50

async function seed() {
  console.log(`Seeding ${SEED_COUNT} users...`)

  for (let i = 0; i < SEED_COUNT; i++) {
    const first = pick(firstNames)
    const last = pick(lastNames)
    const email = `${first.toLowerCase()}.${last.toLowerCase()}.${i}@fake.local`

    const [user] = await db
      .insert(users)
      .values({ email, password: 'seeded' })
      .returning()

    await db.insert(profiles).values({
      userId: user!.id,
      displayName: `${first} ${last}`,
      gender: pick(genders),
      year: pick(years),
      major: pick(majors),
      bio: `Hi! I'm ${first}, a ${pick(majors)} student looking for ${pick(goalOptions).replace('-', ' ')}.`,
      isPublic: Math.random() > 0.3,
      goals: pickN(goalOptions, 1, 3),
      vibes: pickN(vibeOptions, 1, 3),
      interests: pickN(interestOptions, 2, 5),
    })

    process.stdout.write('.')
  }

  console.log('\nDone!')
  await pool.end()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
