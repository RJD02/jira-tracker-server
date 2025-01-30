"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNeed = updateNeed;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function updateNeed(label) {
    const project = await prisma.project2.findFirst({
        where: {
            label: label
        }
    });
    const currentTime = new Date();
    if (project === null)
        return {
            result: true, lastUpdatedTime: currentTime
        };
    const issues = await prisma.issue.findFirst({
        where: {
            project_id: project.id
        },
        orderBy: {
            updated_at: 'desc'
        }
    });
    // console.log(project)
    if (issues === null) {
        return { result: true, lastUpdatedTime: new Date() };
    }
    const lastUpdatedTime = (issues.updated_at);
    // Calculate the difference in time between now and the last updated time
    const timeDifference = currentTime.getTime() - new Date(lastUpdatedTime).getTime(); // in milliseconds
    // Convert milliseconds to minutes
    const minutesDifference = timeDifference / (1000 * 60);
    // Check if the difference is greater than or less than 30 minutes
    if (minutesDifference <= 30) {
        console.log(`time difference less than 30 mins for ${label}`);
        // return false
        return { result: false, lastUpdatedTime: lastUpdatedTime };
    }
    else {
        console.log(`time difference greater than 30 mins for ${label}`);
        // return true
        return { result: true, lastUpdatedTime: lastUpdatedTime };
    }
}
