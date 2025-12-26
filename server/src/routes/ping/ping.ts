import { Hono } from "hono";
const pingRouter = new Hono();

const route = pingRouter.get("/ping", (c) => {
  return c.text("pong", 200, {
    "Content-Type": "text/plain; charset=utf-8",
  });
});

// Alternative health check endpoint that returns JSON
pingRouter.get("/health", (c) => {
  return c.json({ 
    status: "healthy", 
    message: "pong",
    timestamp: new Date().toISOString() 
  });
});

export { pingRouter };
export type PingRoute = typeof route;
