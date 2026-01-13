import 'dotenv/config';
import { db } from './index.js';
import { profiles, interests, profileInterests } from './schema.js';

async function seed() {
  console.log('🌱 Seeding database...');

  /* Clear data */
  await db.delete(profileInterests);
  await db.delete(interests);
  await db.delete(profiles);

  /* Insert profiles */
  const createdProfiles = await db
    .insert(profiles)
    .values([
      {
        name: 'Alice Nguyen',
        email: 'alice@gmail.com',
        bio: 'Love studying with friends',
        major: 'Computer Science',
      },
      {
        name: 'Bob Tran',
        email: 'bob@gmail.com',
        bio: 'Backend developer',
        major: 'Information Systems',
      },
    ])
    .returning();

  /* Insert interests */
  const createdInterests = await db
    .insert(interests)
    .values([
      { name: 'Coding' },
      { name: 'Reading' },
      { name: 'Coffee' },
    ])
    .returning();

  /* Relations */
  await db.insert(profileInterests).values([
    {
      profileId: createdProfiles[0].id,
      interestId: createdInterests[0].id,
    },
    {
      profileId: createdProfiles[0].id,
      interestId: createdInterests[2].id,
    },
    {
      profileId: createdProfiles[1].id,
      interestId: createdInterests[0].id,
    },
  ]);

  console.log('✅ Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed', err);
  process.exit(1);
});
