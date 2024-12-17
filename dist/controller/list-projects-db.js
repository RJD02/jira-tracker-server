"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.allProjectsInDb = allProjectsInDb;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function allProjectsInDb() {
    try {
        const projectDetails = await exports.prisma.project2.findMany();
        // Map the raw project details to the expected structure
        const projectLabelArray = projectDetails.map((project) => {
            return {
                id: project.id, // Ensure id is included correctly
                label: project.label, // Ensure label is included correctly
                key: project.project_key
            };
        });
        return projectLabelArray; // Return the correctly formatted array of projects
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error("Could not fetch projects"); // Throw error for better handling
    }
}
