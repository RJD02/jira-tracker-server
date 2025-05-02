"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLabels = fetchLabels;
exports.processLabel = processLabel;
const client_1 = require("@prisma/client");
const jira_client_1 = require("../../controller/jira-client");
const prisma = new client_1.PrismaClient();
async function fetchLabels() {
    const projects = await prisma.project2.findMany({
        select: { label: true },
    });
    return projects.map((project) => project.label);
}
async function processLabel(label) {
    console.log(`Processing label: ${label}`);
    try {
        // Fetch data for the label
        const lastUpdateTime = new Date(); // Replace with actual logic to get last update time
        await (0, jira_client_1.fetchProjectJiraData)(label, lastUpdateTime);
    }
    catch (error) {
        console.error(`Error processing label ${label}: ${error}`);
    }
    console.log(`Finished processing label: ${label}`);
}
