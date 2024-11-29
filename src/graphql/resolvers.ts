import { PROJECT, getConfig } from "../config/config";
import { fetchProjectJiraData } from "../controller/jira-client";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { Context } from "./server";
import { jiraUserData } from "../utils/assignee_config";

export const prisma = new PrismaClient();
interface AuthPayload {
  token: string;
  user: User;
}

const { GraphQLError } = require('graphql');
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

    jiraUserData: async (_: any, args: { jiraData: { name: string; id: string; role: string }[], projectName: string }) => {
      const { jiraData, projectName } = args;
    
      console.log("Received jiraData:", jiraData);
      console.log("Received projectName:", projectName);
    
      if (!jiraData) {
        throw new Error("jiraData is required but not provided.");
      }
    
      // Process jiraData instead of teamData
      const assigneesData = jiraData.map((member) => ({
        user_name: member.name,
        jira_id: member.id,
        role: member.role,
        project_name: projectName,
      }));
    
      try {
        await prisma.jiraUser.createMany({
          data: assigneesData,
        });
        return { status: 200, message: "Team data inserted successfully" };
      } catch (error) {
        console.error("Error inserting user data:", error);
        throw new Error(`Error inserting user data: ${error}`);
      }
    },
    
    // jiraUserData: async (_: any, args: { teamData: { name: string; id: string; role: string }[], projectName: string }) => {
    //   const { teamData, projectName } = args;

    //   // try {
    //   //   // Use batch insertion for better performance (optional improvement)
    //   //   await jiraUserData(teamData, projectName); 
    //   //   return { 'status': 200, 'message': "Team data inserted successfully" };
    //   // } catch (error) {
    //   //   throw new GraphQLError (`Error inserting team data ${error}`)
    //   //   // console.error("Error inserting team data:", error);
    //   //   return { 'status': 500, 'message': `Error inserting team data: ${error}` };
    //   // }
    //   try {
    //     // Check if the project exists
    //     const project = await prisma.project.findUnique({
    //       where: { name: projectName }, // We're now using the `name` field to find the project
    //     });
    
    //     if (!project) {
    //       throw new GraphQLError(`Project with name ${projectName} not found.`);
    //     }
    
    //     // Prepare the assignee data, linking each assignee to the project using `project_name`
    //     const assigneesData = teamData.map((member) => ({
    //       user_name: member.name,
    //       jira_id: member.id,
    //       role: member.role,
    //       project_name: project.name, // Set `project_name` to link the assignee to the project
    //     }));
    
    //     // Insert the team data (assignees)
    //     await prisma.jiraUser.createMany({
    //       data: assigneesData,
    //     });
    
    //     return { 'status': 200, 'message': "Team data inserted successfully" };
    //   } catch (error) {
    //     console.error("Error inserting user data:", error);
    //     throw new GraphQLError(`Error inserting user data: ${error}`);
    //   }
    // },

    createProject: async (
      _: unknown,
      { label, baseurl, board }: { label: string; baseurl: string; board: string | null }
    ) => {
      try {
        // Creating a new project in the database
        const newProject = await prisma.project.create({
          data: {
            label,
            baseurl,
            board, // this can be null as well
          },
        });
        return newProject;
      } catch (error) {
        throw new GraphQLError(`Error creating project: ${error}`);
      }
      // try {
      //   // Creating a new project in the database
      //   const newProject = await prisma.project.create({
      //     data: {
      //       name,
      //       baseurl,
      //       board, // this can be null as well
      //     },
      //   });
      //   return newProject;
      // } catch (error) {
      //   throw new GraphQLError(`Error creating project: ${error}`);
      // }
    },
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
