import { configuration_db } from "../config/config";
import { fetchProjectJiraData } from "../controller/jira-client";
import { fetchingJiraIssues } from "../controller/jira-issues-data";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { Context } from "./server";
// import { jiraUserData } from "../utils/assignee_config";
import { allProjectsInDb } from "../controller/list-projects-db";
import { listUsers } from "../controller/list-users";
import { GraphQLResolveInfo } from 'graphql';
import { GetListOfProjects } from "../controller/list-projects";
import { listUsersForProject } from "../controller/jira-list-user-in-project";
import { updateNeed } from "../controller/update-checker";

export const prisma = new PrismaClient();

interface GetUsersParams {
  baseurl: string;
  token: string;
  username: string;
  userKey: string;
}

// Define the structure of the returned user object
interface UserResponse {
  account_id: string;  
  emailAddress: string; 
  displayName: string; 
  active: boolean;
}
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
    issues: async function(_: any, { project, forced=false }: { project: string, forced?: Boolean }) {
      console.log("Resolver is running on", project);
      const checking_last_update = await updateNeed(project)
      if (checking_last_update.result || forced)
      {
        return fetchProjectJiraData(project,checking_last_update.lastUpdatedTime);

        
      }
      else
      {
        const ans = await fetchingJiraIssues(project)
        return ans
      }
      
      
    },
    members: async function(_: any, { project }: { project: string }) {
      return (await configuration_db(project)).team;
      // return (await getConfig(project)).team;
    },

    getUsers: async function (_: any, { baseurl, token, username, userKey }: GetUsersParams): Promise<UserResponse> {
      try {
          // Call the external function to fetch user data
          const data = await listUsersForProject(baseurl, token, username, userKey);

        // If no data is returned, throw an error
        if (!data || data.length === 0) {
            throw new Error('No users found');
        }

        // Map to return the list of users
        const users = data.map((user: { accountId: String; emailAddress: String; displayName: String; active: Boolean; }) => ({
            account_id: user.accountId || '', // Adjust field based on your requirements
            emailAddress: user.emailAddress || '',
            displayName: user.displayName || '',
            active: user.active !== undefined ? user.active : false, // Default to false if not present
        }));

        return users;
      } catch (error) {
          console.error('Error in resolver:', error);
          throw new Error('Failed to fetch user');
      }
  },

    jiraprojects: async function (_: any, { baseurl, token, username }: { baseurl: string, token: string, username: string }) {
      try {
        // Call the GetListOfProjects function with dynamic arguments
        const projects = await GetListOfProjects(baseurl, token, username);
        // console.log(projects)
        return projects;
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Failed to fetch projects');
      }
    },
    allProjects: async () => {
      try {
          const projectDetails = await allProjectsInDb();
          // console.log("Retrieving Projects");
          // console.log(projectDetails); 
          return projectDetails; // This should now return valid project details
      } catch (error) {
          console.error("Error fetching projects:", error);
          throw new Error("Could not fetch projects");
      }
  },
  usersForProject: async (_: unknown, { projectId }: { projectId: string }, info: GraphQLResolveInfo ) => { 
    try {
        // Call the listUsers function with the provided projectId
        const users = await listUsers(projectId);
        // console.log("Users:", users);

        // If 'users' is undefined, return an empty array or handle it accordingly
        if (!users) {
            return []; // Or handle this case differently if you need
        }

        // Map the users to the expected format
        const formattedUsers = users.map(user => ({
            id: user.id, // Map the user id (or use jira_id if that should be the 'id' field)
            name: user.user_name, // Map the user name
            jira_id: user.jira_id, // You can add the actual email if it's available in your data
        }));

        return formattedUsers; // This returns the list of users for the specified project
    } catch (error) {
        console.error("Error fetching users for project:", error);
        throw new Error("Could not fetch users for project");
    }
},

    // projects() {
    //   const projects: { id: PROJECT; label: string }[] = [
    //     { id: "SALAM", label: "Salam" },
    //     { id: "STAR", label: "Star" },
    //     { id: "CUSTOMER_SUCCESS", label: "Customer Success" },
    //     { id: "VDA", label: "VDA" },
    //   ];
    //   return projects;
    // },
  },
  Mutation: {
    deleteProject: async(_: any, { label }:{ label: string }) => {
      try{
        const project_ = await prisma.project2.findUnique({
          where: { label },
        });

        if (!project_)
        {
          throw new Error(`Project name ${project_} doesn't exists`);
        }

        await prisma.issue.deleteMany({
          where: { project_id: project_.id },
        });
    
        // Delete related Jira users
        await prisma.jiraUser.updateMany({
          where: {
            projects: {
              some: { id: project_.id },
            },
          },
          data: {}
        });
    
        // Delete the project
        const deletedProject = await prisma.project2.delete({
          where: { label },
        });
    
        return { status: 200, success: true, message: "Project was deleted" };
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to delete project: ${error}`);
      }
    },

    deleteJiraUser: async (_: any, { jira_id }: { jira_id: string }) => {
      try {
        // Ensure the user exists before deletion
        const user = await prisma.jiraUser.findUnique({
          where: { jira_id },
        });
        if (!user) {
          throw new Error(`Jira user with id ${jira_id} not found.`);
        }

        // Delete the Jira user
        const deletedUser = await prisma.jiraUser.delete({
          where: { jira_id },
        });
        return { status: 200,success: true, message: "User was deleted" }
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to delete Jira user: ${error}`);
      }
    },
  jiraUserData: async (
    _: any,
    args: { jiraData: { name: string; id: string; role: string; projectId: string }[] }
  ): Promise<{ success: boolean; message: string | null }> => {
    try {
      const { jiraData } = args;
  
      console.log("Received jiraData:", jiraData);
  
      if (!jiraData || jiraData.length === 0) {
        throw new Error("jiraData is required but not provided.");
      }
  
      const assigneesData = await Promise.all(
        jiraData.map(async (member) => {
          // Find the project by the projectId (URL)
          const project = await prisma.project2.findUnique({
            where: { id: member.projectId },
          });
  
          if (!project) {
            // If project does not exist, throw an error with a specific message
            throw new Error(`Project not registered for projectId: ${member.projectId}`);
          }
  
          // Check if the JiraUser already exists by jira_id
          const existingUser = await prisma.jiraUser.findUnique({
            where: { jira_id: member.id },
          });
  
          if (existingUser) {
            // If the user exists, connect the user to the new project
            return {
              where: { jira_id: member.id },  // Find the existing user
              update: {
                projects: {
                  connect: { id: project.id },  // Connect the user to the new project
                },
              },
            };
          } else {
            // If the user does not exist, create a new user and connect to the project
            return {
              create: {
                user_name: member.name,
                jira_id: member.id,
                role: member.role,
                projects: {
                  connect: { id: project.id },  // Create the user and connect to the project
                },
              },
            };
          }
        })
      );
  
      // Perform the insert or update operation based on the data
      await Promise.all(
        assigneesData.map(async (data) => {
          if (data.create) {
            // Create new user if necessary
            await prisma.jiraUser.create({ data: data.create });
          } else if (data.update) {
            // Update existing user if necessary
            await prisma.jiraUser.update({
              where: data.where,
              data: data.update,
            });
          }
        }));
  
      return { success: true, message: "User was inserted or updated successfully" };
    } catch (error) {
      console.error("Error inserting or updating user data:", error);
      // Return the error message that contains "Project not registered"
      return { success: false, message: "User not inserted or updated successfully" };
    }
  },  
  
  

  // Resolver for createSiteUrl
  createSiteUrl: async (_: any, { site_url }: { site_url: string }) => {
    try {
      const newSiteUrl = await prisma.siteUrlTable.create({
        data: {
          site_url,
        },
      });
      return newSiteUrl;
    } catch (error) {
      console.error("Error creating site URL:", error);
      throw new GraphQLError(`Error creating site URL: ${error}`);
    }
  },

  // Resolver for createProject2
  createProject2: async (_: any, { id, site_id, label,project_key,email,token,board }: { id: string,site_id: number; label: string,project_key: string, email: string, token: string, board: string | null }) => {
    try {
      // Check if the site exists
      const siteUrl = await prisma.siteUrlTable.findUnique({
        where: { site_id: Number(site_id) },
      });

      if (!siteUrl) {
        throw new Error("Site URL does not exist");
      }

      // Create new project
      const newProject = await prisma.project2.create({
        data: {
          id,
          label,
          project_key,
          email,
          token,
          board,
          baseurl: {
            connect: {
              site_id: Number(site_id), // Ensure this ID exists in SiteUrlTable
            },
          },

        },
      });

      return newProject;
    } catch (error) {
      console.error("Error creating project2:", error);
      throw new GraphQLError(`Error creating project2: ${error}`);
    }
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
