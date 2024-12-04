import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

export async function allProjectsInDb() {
    try {
        const projectDetails = await prisma.project2.findMany();
        
        // Map the raw project details to the expected structure
        const projectLabelArray = projectDetails.map((project) => {
            return {
                id: project.id,      // Ensure id is included correctly
                label: project.label  // Ensure label is included correctly
            };
        });

        return projectLabelArray; // Return the correctly formatted array of projects

    } catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error("Could not fetch projects"); // Throw error for better handling
    }
}
