import { db } from "../../db/index.ts";
import { usersTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export async function updateUsername(userId: string, username: string) {
  try {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        username,
        updated_at: new Date(),
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return {
      success: true as const,
      user: updatedUser,
    };
  } catch (error: any) {
    console.error("Failed to update username:", error);
    return {
      success: false as const,
      error: "Failed to update username, it may already be taken",
    };
  }
}
