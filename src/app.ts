import dotenv from "dotenv";
dotenv.config();
import { getUserFromToken, server } from "./graphql/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { prisma } from "./graphql/resolvers";

const port = Number(process.env.PORT) || 5000;

async function start() {
  const { url } = await startStandaloneServer(server, {
    // highlight-start
    listen: { port },
    context: async ({ req }) => {
      // get the user token from the headers
      console.log("Building context", req.headers.authorization);
      const token = req.headers.authorization || "";
      console.log(token);
      const user = await getUserFromToken(token);
      return { user, prisma };
    },
  });

  console.log(`🚀 Server listening at: ${url}`);
}

start().then(() => {
  console.log("Started Server");
});
