import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import * as jiraController from "./controller/jira-client";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { server } from "./server";

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Working" });
});
app.get("/salam", jiraController.fetchJiraData);
app.get("/star", jiraController.fetchJiraData);
app.get("/customer_success", jiraController.fetchJiraData);

async function start() {
  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server)
  );
  app.listen(port, () => {
    console.log(`Server is online at: http://localhost:${port}`);
  });

  console.log(`🚀 Server ready at http://localhost:4000/`);
}

start().then(() => {
  console.log("Started Server");
});
export default app;
