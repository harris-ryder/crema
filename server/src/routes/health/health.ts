import { Hono } from "hono";
const healthRouter = new Hono();

// Alternative health check endpoint that returns JSON
const route = healthRouter.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export { healthRouter };
export type HealthRoute = typeof route;
