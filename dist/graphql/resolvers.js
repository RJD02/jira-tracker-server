"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.prisma = void 0;
const config_1 = require("../config/config");
const jira_client_1 = require("../controller/jira-client");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("./config");
const list_projects_db_1 = require("../controller/list-projects-db");
const list_users_1 = require("../controller/list-users");
const list_projects_1 = require("../controller/list-projects");
const jira_list_user_in_project_1 = require("../controller/jira-list-user-in-project");
exports.prisma = new client_1.PrismaClient();
const { GraphQLError } = require('graphql');
exports.resolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.user) {
                throw new Error("Not authenticated");
            }
            return context.user;
        },
        issues(_, { project }) {
            console.log("Resolver is running");
            return (0, jira_client_1.fetchProjectJiraData)(project);
        },
        members(_, { project }) {
            return (0, config_1.getConfig)(project).team;
        },
        getUsers: async function (_, { baseurl, token, username, userKey }) {
            try {
                // Call the external function to fetch user data
                const data = await (0, jira_list_user_in_project_1.listUsersForProject)(baseurl, token, username, userKey);
                // If no data is returned, throw an error
                if (!data || data.length === 0) {
                    throw new Error('No users found');
                }
                // Map to return the list of users
                const users = data.map((user) => ({
                    account_id: user.accountId || '', // Adjust field based on your requirements
                    emailAddress: user.emailAddress || '',
                    displayName: user.displayName || '',
                    active: user.active !== undefined ? user.active : false, // Default to false if not present
                }));
                return users;
            }
            catch (error) {
                console.error('Error in resolver:', error);
                throw new Error('Failed to fetch user');
            }
        },
        jiraprojects: async function (_, { baseurl, token, username }) {
            try {
                // Call the GetListOfProjects function with dynamic arguments
                const projects = await (0, list_projects_1.GetListOfProjects)(baseurl, token, username);
                // console.log(projects)
                return projects;
            }
            catch (error) {
                console.error('Error fetching projects:', error);
                throw new Error('Failed to fetch projects');
            }
        },
        allProjects: async () => {
            try {
                const projectDetails = await (0, list_projects_db_1.allProjectsInDb)();
                // console.log("Retrieving Projects");
                // console.log(projectDetails); 
                return projectDetails; // This should now return valid project details
            }
            catch (error) {
                console.error("Error fetching projects:", error);
                throw new Error("Could not fetch projects");
            }
        },
        usersForProject: async (_, { projectId }, info) => {
            try {
                // Call the listUsers function with the provided projectId
                const users = await (0, list_users_1.listUsers)(projectId);
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
            }
            catch (error) {
                console.error("Error fetching users for project:", error);
                throw new Error("Could not fetch users for project");
            }
        },
        projects() {
            const projects = [
                { id: "SALAM", label: "Salam" },
                { id: "STAR", label: "Star" },
                { id: "CUSTOMER_SUCCESS", label: "Customer Success" },
                { id: "VDA", label: "VDA" },
            ];
            return projects;
        },
    },
    Mutation: {
        jiraUserData: async (_, args) => {
            try {
                const { jiraData } = args;
                console.log("Received jiraData:", jiraData);
                if (!jiraData || jiraData.length === 0) {
                    throw new Error("jiraData is required but not provided.");
                }
                const assigneesData = await Promise.all(jiraData.map(async (member) => {
                    // Find the project by the projectId (URL)
                    const project = await exports.prisma.project2.findUnique({
                        where: { id: member.projectId },
                    });
                    if (!project) {
                        // If project does not exist, throw an error with a specific message
                        throw new Error(`Project not registered for projectId: ${member.projectId}`);
                    }
                    // Check if the JiraUser already exists by jira_id
                    const existingUser = await exports.prisma.jiraUser.findUnique({
                        where: { jira_id: member.id },
                    });
                    if (existingUser) {
                        // If the user exists, connect the user to the new project
                        return {
                            where: { jira_id: member.id }, // Find the existing user
                            update: {
                                projects: {
                                    connect: { id: project.id }, // Connect the user to the new project
                                },
                            },
                        };
                    }
                    else {
                        // If the user does not exist, create a new user and connect to the project
                        return {
                            create: {
                                user_name: member.name,
                                jira_id: member.id,
                                role: member.role,
                                projects: {
                                    connect: { id: project.id }, // Create the user and connect to the project
                                },
                            },
                        };
                    }
                }));
                // Perform the insert or update operation based on the data
                await Promise.all(assigneesData.map(async (data) => {
                    if (data.create) {
                        // Create new user if necessary
                        await exports.prisma.jiraUser.create({ data: data.create });
                    }
                    else if (data.update) {
                        // Update existing user if necessary
                        await exports.prisma.jiraUser.update({
                            where: data.where,
                            data: data.update,
                        });
                    }
                }));
                return { success: true, message: "User was inserted or updated successfully" };
            }
            catch (error) {
                console.error("Error inserting or updating user data:", error);
                // Return the error message that contains "Project not registered"
                return { success: false, message: "User not inserted or updated successfully" };
            }
        },
        // Resolver for createSiteUrl
        createSiteUrl: async (_, { site_url }) => {
            try {
                const newSiteUrl = await exports.prisma.siteUrlTable.create({
                    data: {
                        site_url,
                    },
                });
                return newSiteUrl;
            }
            catch (error) {
                console.error("Error creating site URL:", error);
                throw new GraphQLError(`Error creating site URL: ${error}`);
            }
        },
        // Resolver for createProject2
        createProject2: async (_, { id, site_id, label, email, token, board }) => {
            try {
                // Check if the site exists
                const siteUrl = await exports.prisma.siteUrlTable.findUnique({
                    where: { site_id: Number(site_id) },
                });
                if (!siteUrl) {
                    throw new Error("Site URL does not exist");
                }
                // Create new project
                const newProject = await exports.prisma.project2.create({
                    data: {
                        id,
                        label,
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
            }
            catch (error) {
                console.error("Error creating project2:", error);
                throw new GraphQLError(`Error creating project2: ${error}`);
            }
        },
        signup: async (_, { username, password }) => {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await exports.prisma.user.create({
                data: { username, password: hashedPassword },
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_2.JWT_SECRET);
            return {
                token,
                user,
            };
        },
        login: async (_, { username, password }, { prisma, user: u }) => {
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user) {
                throw new Error("No user found with that username");
            }
            const valid = await bcryptjs_1.default.compare(password, user.password);
            if (!valid) {
                throw new Error("Invalid password");
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_2.JWT_SECRET);
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
