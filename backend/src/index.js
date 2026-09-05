import "dotenv/config";
import http from "node:http";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import cors from "cors";
import { createContext } from "./context.js";
import { apolloQueryTracePlugin } from "./instrumentation/apolloQueryTracePlugin.js";
import { schema } from "./schema.js";

const port = Number(process.env.PORT ?? 4000);
const app = express();
const httpServer = http.createServer(app);
const graphqlServer = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    apolloQueryTracePlugin,
  ],
});

await graphqlServer.start();

app.disable("x-powered-by");
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "postly-backend" });
});

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(graphqlServer, {
    context: async ({ req }) => createContext(req),
  }),
);

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

httpServer.listen(port, () => {
  console.log(`Postly backend listening on http://localhost:${port}`);
});
