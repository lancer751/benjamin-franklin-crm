import app from "./app";

const port = Number(Bun.env.PORT ?? 5000);

const server = Bun.serve({
  port: port,
  fetch: app.fetch
});

console.log(`Server running at ${server.url}`);
console.log("NODE_ENV:", Bun.env.NODE_ENV);