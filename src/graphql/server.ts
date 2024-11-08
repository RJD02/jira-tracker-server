import { ApolloServer } from "@apollo/server";

import express from "express";
import { PrismaClient, User } from "@prisma/client";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware"; // To apply graphql-shield

import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { prisma, resolvers } from "./resolvers";
import { JWT_SECRET } from "./config";
import { permissions } from "./permission";

export interface Context {
  user?: User;
  prisma: PrismaClient;
}
// Middleware to authenticate user based on token
export const getUserFromToken = async (token: string): Promise<User | null> => {
  try {
    console.log("inside get user from token", token);
    if (token) {
      //remove Bearer
      token = token.replace("Bearer ", "");
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      console.log(decoded);
      console.log(
        await prisma.user.findUnique({ where: { id: decoded.userId } })
      );
      return await prisma.user.findUnique({ where: { id: decoded.userId } });
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Apply permissions middleware to the schema
const schemaWithMiddleware = applyMiddleware(schema, permissions);

export const server = new ApolloServer({
  schema: schemaWithMiddleware,
  // typeDefs,
  // resolvers,
});
