import { PROJECT, getConfig } from "../config/config";
import { fetchProjectJiraData } from "../controller/jira-client";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { Context } from "./server";

export const prisma = new PrismaClient();
interface AuthPayload {
  token: string;
  user: User;
}

export const resolvers = {
  Query: {
    me: async (
      _: unknown,
      __: unknown,
      context: { user?: User }
    ): Promise<User | null> => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return context.user;
    },
    issues(_: any, { project }: { project: PROJECT }) {
      console.log("Resolver is running");
      return fetchProjectJiraData(project);
    },
    members(_: any, { project }: { project: PROJECT }) {
      return getConfig(project).team;
    },
    projects() {
      const projects: { id: PROJECT; label: string }[] = [
        { id: "SALAM", label: "Salam" },
        { id: "STAR", label: "Star" },
        { id: "CUSTOMER_SUCCESS", label: "Customer Success" },
        { id: "VDA", label: "VDA" },
      ];
      return projects;
    },
  },
  Mutation: {
    signup: async (
      _: unknown,
      { username, password }: { username: string; password: string }
    ): Promise<AuthPayload> => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, password: hashedPassword },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      return {
        token,
        user,
      };
    },
    login: async (
      _: unknown,
      { username, password }: { username: string; password: string },
      { prisma, user: u }: Context
    ): Promise<AuthPayload> => {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        throw new Error("No user found with that username");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      console.log({
        token,
        user,
      });
      return {
        token,
        user,
      };
    },
  },
};
