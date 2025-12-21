import Fastify from "fastify";
import multipart from "@fastify/multipart";
import processRoute from "./routes/process.js";
import cors from '@fastify/cors';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: '*',
});

await app.register(multipart, {
  attachFieldsToBody: true,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
    fields: 5,
  },
});

await app.register(processRoute, { prefix: "/process" });

await app.listen({ port: 3000, host: "0.0.0.0" });
