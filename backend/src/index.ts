import { app } from "./app";

const server = Bun.serve({
  fetch: app.fetch,
});

console.log(`Server running at ${server.url}`);
console.log("NODE_ENV:", Bun.env.NODE_ENV);
