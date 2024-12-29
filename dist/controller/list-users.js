"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.listUsers = listUsers;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function listUsers(project_id) {
    try {
        // console.log(project_id)
        const projectWithUsers = await exports.prisma.project2.findUnique({
            where: {
                id: project_id,
            },
            include: {
                jiraUsers: true, // include associated JiraUsers
            },
        });
        if (!projectWithUsers) {
            console.log(`No project found with ID: ${project_id}`);
            return [];
        }
        console.log(projectWithUsers.jiraUsers); // This will contain the list of users for the specified project
        return projectWithUsers.jiraUsers;
    }
    catch (error) {
        console.error('Error fetching users:', error);
    }
}
