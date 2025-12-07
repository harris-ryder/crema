import { AppType } from "@server/type.d";
import { hc } from "hono/client";

// Test that AppType works with hono/client now that versions are aligned
const client = hc<AppType>("http://localhost:3000");

// The client should now have typed methods for all routes
console.log("Client created successfully with AppType");

// Example of typed API calls that should now work:
// client.users.me.$get()
// client.posts.$get()
// client.images.$post()

export { client };