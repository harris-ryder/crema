import { db } from "../../db/index.ts";
import { usersTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

interface ErrorResponse {
  success: false;
  error: string;
}

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

    return <{ success: true; user: typeof updatedUser }>{
      success: true,
      user: updatedUser,
    };
  } catch (error: any) {
    console.error("Failed to update username:", error);
    return <ErrorResponse>{
      success: false,
      error: "Failed to update username, it may already be taken",
    };
  }
}
