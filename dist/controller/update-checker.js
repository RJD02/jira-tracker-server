"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNeed = updateNeed;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function updateNeed(label) {
    const project = await prisma.project2.findMany({
        where: {
            label: label
        },
        include: {
            issues: true, // Include related issues
            baseurl: true
        }
    });
    // console.log(project)
    const lastUpdatedTime = (project[0].issues[0].updated_at);
    const currentTime = new Date();
    // Calculate the difference in time between now and the last updated time
    const timeDifference = currentTime.getTime() - new Date(lastUpdatedTime).getTime(); // in milliseconds
    // Convert milliseconds to minutes
    const minutesDifference = timeDifference / (1000 * 60);
    // Check if the difference is greater than or less than 30 minutes
    if (minutesDifference <= 30) {
        console.log(`time difference less than 30 mins for ${label}`);
        return false;
    }
    else {
        console.log(`time difference greater than 30 mins for ${label}`);
        return true;
    }
}
