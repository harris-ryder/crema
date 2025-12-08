import {
  pgTable,
  uuid,
  text,
  timestamp,
  type ReferenceConfig,
  integer,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

const cascade: ReferenceConfig["actions"] = {
  onDelete: "cascade",
  onUpdate: "cascade",
};

const timestamps = {
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
};

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  username: text().unique().notNull(),
  email: text().unique().notNull(),
  password: text(),
  bio: text(),
  password_salt: text(),
  avatar_uri: text(),
  ...timestamps,
});

export const postsTable = pgTable("posts", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  description: text(),
  image_uri: text().notNull(),
  user_id: uuid()
    .references(() => usersTable.id, cascade)
    .notNull(),
  ...timestamps,
});

export const reactionEnum = pgEnum("reaction_emoji", [
  "👍",
  "❤️",
  "😂",
  "🔥",
  "🎉",
  "👏",
]);

export const postReactionsTable = pgTable(
  "post_reactions",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    post_id: uuid()
      .references(() => postsTable.id, cascade)
      .notNull(),
    user_id: uuid()
      .references(() => usersTable.id, cascade)
      .notNull(),
    emoji: reactionEnum("emoji").notNull(),
    ...timestamps,
  },
  (table) => ({
    // One reaction per user per post (user can change their reaction)
    uniqueUserPost: unique().on(table.post_id, table.user_id),
  })
);
