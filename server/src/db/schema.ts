import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  type ReferenceConfig,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

const cascade: ReferenceConfig["actions"] = {
  onDelete: "cascade",
  onUpdate: "cascade",
};

const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  username: text().unique().notNull(),
  email: text().unique().notNull(),
  bio: text(),
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
  post_tz: text().notNull(), // e.g. "Asia/Shanghai"
  local_date: date("local_date").notNull(), // poster-local calendar date
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
  (table) => [unique().on(table.post_id, table.user_id)]
);
