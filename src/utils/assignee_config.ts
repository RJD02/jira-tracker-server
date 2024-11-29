import { JiraCredential } from "../types/types";
import * as starConfig from "../config/star/star-config";
import * as salamConfig from "../config/salam/salam-config";
import * as vdaConfig from "../config/vda/vda-config";
import * as customerSuccessConfig from "../config/customer-success/cs-config";
import * as csTeam from "../config/customer-success/cs-team";
import * as starTeam from "../config/star/star-team";
import * as salamTeam from "../config/salam/salam-team";
import * as microTeam from "../config/microui/microui-team";
import * as vdaTeam from "../config/vda/vda-team";
import { TeamMember } from "../types/team";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// export async function insertTeamData(teamData: { name: string, id: string, role: string }[], projectName: string) {
//   for (const member of teamData) {
//     try {
//       await prisma.assignee.create({
//         data: {
//           project_name: projectName,   // Assign project name (can be dynamic if needed)
//           user_name: member.name,      // Map 'name' to 'user_name'
//           jira_id: member.id,          // Map 'id' to 'jira_id'
//           role: member.role,           // Map 'role' as is
//         },
//       });
//       // console.log(`Inserted project for: ${member.name} in project: ${projectName}`);
//     } catch (error) {
//       return JSON.stringify({error: `Error inserting project for ${member.name} in project: ${projectName}: ${error}`});
//       // console.error(`Error inserting project for ${member.name} in project: ${projectName}:`, error);
//     }
//   }
// }

// Main function to insert all team data
export async function insertAllTeams() {
  // Insert data for each team with their respective project name
  console.log("inserting user data");
  await jiraUserData(csTeam.customerSuccessTeam, "Customer Success Project");
  await jiraUserData(starTeam.starTeam, "STAR Project");
  await jiraUserData(salamTeam.salamTeam, "SALAM Project");
  await jiraUserData(microTeam.microUiTeam, "Micro UI Project");
  await jiraUserData(vdaTeam.vdaTeam, "VDA Project");
}

// Execute the insertion
// insertAllTeams();

export async function jiraUserData(jiraData: { name: string, id: string, role: string }[], projectName: string) {
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
  } catch (error) {
    console.error("Error inserting team data:", error);
    throw new Error(`Error inserting team data: ${error}`);
  }
}
