"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.configuration_db = configuration_db;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
// export type PROJECT = "STAR" | "SALAM" | "CUSTOMER_SUCCESS" | "VDA";
async function configuration_db(project_name) {
    try {
        const projects = await exports.prisma.project2.findMany({
            where: {
                label: project_name
            },
            include: {
                baseurl: true,
                jiraUsers: true, // This will include related JiraUsers for each project
            },
        });
        if (projects.length > 0) {
            const jiraUsersMapped = projects[0].jiraUsers.map((user) => ({
                name: user.user_name, // Rename user_name to name
                id: user.jira_id, // Rename jira_id to id
                role: user.role, // Keep role as is
            }));
            const creds = {
                protocol: "https",
                host: projects[0].baseurl.site_url || "error",
                username: projects[0].email || "error",
                password: projects[0].token || "error",
                apiVersion: "2",
                strictSSL: true,
            };
            const result = {
                baseurl: projects[0].baseurl.site_url, // Access the baseurl from the first project
                credential: creds, // Access the token from the first project
                team: jiraUsersMapped, // The mapped Jira users data
            };
            // console.log(result); // This will log the returned object
            return result;
        }
        else {
            // If no project is found, throw an error
            throw new Error(`Project with name "${project_name}" doesn't exist.`);
        }
    }
    catch (error) {
        // Handle the error
        console.error("Error in fetching project configuration:", error);
        throw error; // Rethrow the error after logging it
    }
}
