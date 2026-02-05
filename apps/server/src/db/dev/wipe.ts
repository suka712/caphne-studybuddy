import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { sql } from 'drizzle-orm'
import { matches, profiles, emailCollection, users } from '../schema.js'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

async function wipe() {
  console.log('Wiping all data...')

  await db.delete(matches)
  await db.delete(profiles)
  await db.delete(emailCollection)
  await db.delete(users)

  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE profiles_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE matches_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE email_collection_id_seq RESTART WITH 1`)

  console.log('All tables done wiping.')
  await pool.end()
}

wipe().catch((e) => {
  console.error(e)
  process.exit(1)
})
