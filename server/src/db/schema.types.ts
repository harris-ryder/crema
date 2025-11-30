import { usersTable, postsTable, postReactionsTable } from "./schema.ts";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const selectUserSchema = createSelectSchema(usersTable);
export const insertUserSchema = createInsertSchema(usersTable);

export const selectPostSchema = createSelectSchema(postsTable);
export const insertPostSchema = createInsertSchema(postsTable);

export const selectPostReactionSchema = createSelectSchema(postReactionsTable);
export const insertPostReactionSchema = createInsertSchema(postReactionsTable);
