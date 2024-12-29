"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiraUserData = jiraUserData;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Main function to insert all team data
// export async function insertAllUsers() {
//   // Insert data for each team with their respective project name
//   console.log("inserting user data");
//   await jiraUserData(csTeam.customerSuccessTeam, "Customer Success Project");
//   await jiraUserData(starTeam.starTeam, "STAR Project");
//   await jiraUserData(salamTeam.salamTeam, "SALAM Project");
//   await jiraUserData(microTeam.microUiTeam, "Micro UI Project");
//   await jiraUserData(vdaTeam.vdaTeam, "VDA Project");
// }
// this function is used to insert data
async function jiraUserData(jiraData, projectName) {
    try {
        await prisma.jiraUser.createMany({
            data: jiraData.map(member => ({
                project_name: projectName,
                user_name: member.name,
                jira_id: member.id,
                role: member.role,
            })),
        });
        return { status: "success", message: "Team data inserted successfully" };
    }
    catch (error) {
        console.error("Error inserting team data:", error);
        throw new Error(`Error inserting team data: ${error}`);
    }
}
