import {
  usersTable,
  postsTable,
  userAvatarsTable,
  postImagesTable,
  postReactionsTable,
} from "./schema.js";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const selectUserSchema = createSelectSchema(usersTable);
export const insertUserSchema = createInsertSchema(usersTable);

export const selectPostSchema = createSelectSchema(postsTable);
export const insertPostSchema = createInsertSchema(postsTable);

export const selectUserAvatarSchema = createSelectSchema(userAvatarsTable);
export const insertUserAvatarSchema = createInsertSchema(userAvatarsTable);

export const selectPostImageSchema = createSelectSchema(postImagesTable);
export const insertPostImageSchema = createInsertSchema(postImagesTable);

export const selectPostReactionSchema = createSelectSchema(postReactionsTable);
export const insertPostReactionSchema = createInsertSchema(postReactionsTable);
