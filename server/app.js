import Fastify from "fastify";
import multipart from "@fastify/multipart";
import processRoute from "./routes/process.js";

const app = Fastify({ logger: true });

await app.register(multipart, {
  limits: {
    fileSize: 200 * 1024 * 1024 // 200 MB
  }
});

await app.register(processRoute, { prefix: "/process" });

await app.listen({ port: 3000, host: "0.0.0.0" });
