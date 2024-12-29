import { JiraCredential } from "../types/types";
// import * as starConfig from "../config/star/star-config";
// import * as salamConfig from "../config/salam/salam-config";
// import * as vdaConfig from "../config/vda/vda-config";
// import * as customerSuccessConfig from "../config/customer-success/cs-config";

import { TeamMember } from "../types/team";


import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

interface Config {
  baseurl: string;
  board?: string;
  credential: JiraCredential;
  team: TeamMember[];
}
// export type PROJECT = "STAR" | "SALAM" | "CUSTOMER_SUCCESS" | "VDA";

export async function configuration_db(project_name: string): Promise<Config> {
  try {
      const projects = await prisma.project2.findMany({
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
              name: user.user_name,  // Rename user_name to name
              id: user.jira_id,      // Rename jira_id to id
              role: user.role,       // Keep role as is
          }));

          const creds: JiraCredential = {
            protocol: "https",
            host: projects[0].baseurl.site_url || "error",
            username: projects[0].email || "error",
            password: projects[0].token || "error",
            apiVersion: "2",
            strictSSL: true,
                    }
      
          const result = {
              baseurl: projects[0].baseurl.site_url, // Access the baseurl from the first project
              credential: creds, // Access the token from the first project
              team: jiraUsersMapped, // The mapped Jira users data
          };
      
          // console.log(result); // This will log the returned object
          return result;
      } else {
          // If no project is found, throw an error
          throw new Error(`Project with name "${project_name}" doesn't exist.`);
      }
  } catch (error) {
      // Handle the error
      console.error("Error in fetching project configuration:", error);
      throw error; // Rethrow the error after logging it
  }
}
