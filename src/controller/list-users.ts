import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function listUsers(project_id: string) {
    try {
        // console.log(project_id)
        const projectWithUsers = await prisma.project2.findUnique({
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
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}
