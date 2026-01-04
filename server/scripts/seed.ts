import { db } from "../src/db/index.ts";
import { usersTable, postsTable, postReactionsTable } from "../src/db/schema.ts";
import { DateTime } from "luxon";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

// Configuration
const NUM_USERS = 8;
const WEEKS_TO_GENERATE = 6; // Current week + 5 weeks back
const MIN_POSTS_PER_USER_PER_WEEK = 0;
const MAX_POSTS_PER_USER_PER_WEEK = 3;
const REACTION_PROBABILITY = 0.3; // 30% chance a post gets reactions

// Sample data for realistic usernames
const firstNames = [
  "Alex", "Jordan", "Taylor", "Casey", "Morgan",
  "Riley", "Cameron", "Jamie", "Avery", "Quinn"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones",
  "Garcia", "Miller", "Davis", "Martinez", "Wilson"
];

const emojis = ["👍", "❤️", "😂", "🔥", "🎉", "👏"] as const;

// Helper to generate Picsum image URL
function getPicsumUrl(seed: string, width = 800, height = 600): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Generate a random username
function generateUsername(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const number = Math.floor(Math.random() * 100);
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${number}`;
}

// Generate random number between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main seed function
async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(postReactionsTable);
    await db.delete(postsTable);
    await db.delete(usersTable);

    // Create users
    console.log(`👥 Creating ${NUM_USERS} users...`);
    const users = [];
    
    for (let i = 0; i < NUM_USERS; i++) {
      const username = generateUsername();
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      const [user] = await db.insert(usersTable).values({
        id: randomUUID(),
        username: username,
        display_name: `${firstName} ${lastName}`,
        email: `${username}@example.com`,
        bio: `Hi, I'm ${firstName}! I love sharing moments from my daily life.`,
        avatar_uri: getPicsumUrl(`avatar-${username}`, 200, 200),
      }).returning();
      
      users.push(user);
      console.log(`   ✓ Created user: ${user.username}`);
    }

    // Calculate date ranges
    const now = DateTime.local().setZone("Europe/London");
    const currentWeekStart = now.startOf("week");
    
    console.log(`📅 Generating posts for ${WEEKS_TO_GENERATE} weeks...`);
    console.log(`   Current week: ${currentWeekStart.weekYear}-W${currentWeekStart.weekNumber}`);

    // Create posts for each week
    const allPosts = [];
    
    for (let weekOffset = 0; weekOffset < WEEKS_TO_GENERATE; weekOffset++) {
      const weekStart = currentWeekStart.minus({ weeks: weekOffset });
      const weekYear = weekStart.weekYear;
      const weekNumber = weekStart.weekNumber;
      
      console.log(`\n   Week ${weekYear}-W${weekNumber}:`);
      
      // Each user may post multiple times per week
      for (const user of users) {
        const numPosts = randomInt(MIN_POSTS_PER_USER_PER_WEEK, MAX_POSTS_PER_USER_PER_WEEK);
        
        for (let p = 0; p < numPosts; p++) {
          // Random day within the week (0-6)
          const dayOffset = randomInt(0, 6);
          const postDate = weekStart.plus({ days: dayOffset });
          
          const [post] = await db.insert(postsTable).values({
            id: randomUUID(),
            user_id: user.id,
            image_uri: getPicsumUrl(`post-${user.id}-${weekOffset}-${p}`, 800, 600),
            local_date: postDate.toISODate()!,
            created_at: postDate.toJSDate(),
            updated_at: postDate.toJSDate(),
          }).returning();
          
          allPosts.push({ post, user });
        }
        
        if (numPosts > 0) {
          console.log(`      ✓ ${user.username}: ${numPosts} posts`);
        }
      }
    }
    
    console.log(`\n📸 Created ${allPosts.length} total posts`);

    // Add reactions
    console.log("\n💖 Adding reactions to posts...");
    let totalReactions = 0;
    
    for (const { post, user: postOwner } of allPosts) {
      // Randomly decide if this post gets reactions
      if (Math.random() < REACTION_PROBABILITY) {
        // Random number of users will react (1 to half of users)
        const numReactors = randomInt(1, Math.floor(users.length / 2));
        
        // Shuffle users and pick reactors
        const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
        const reactors = shuffledUsers.slice(0, numReactors);
        
        for (const reactor of reactors) {
          // Don't let users react to their own posts (optional)
          if (reactor.id === postOwner.id && Math.random() < 0.7) continue;
          
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          
          await db.insert(postReactionsTable).values({
            id: randomUUID(),
            post_id: post.id,
            user_id: reactor.id,
            emoji: emoji,
          });
          
          totalReactions++;
        }
      }
    }
    
    console.log(`   ✓ Added ${totalReactions} reactions`);

    // Summary
    console.log("\n✨ Seed completed successfully!");
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${allPosts.length} posts created`);
    console.log(`   - ${totalReactions} reactions added`);
    console.log(`   - Posts span from ${currentWeekStart.minus({ weeks: WEEKS_TO_GENERATE - 1 }).toISODate()} to ${currentWeekStart.plus({ days: 6 }).toISODate()}`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed
seed();