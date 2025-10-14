// import JiraClient from "jira-client";
import { Version3Client } from 'jira.js';
// const { Version3Client } =  import('jira.js');

export async function GetListOfProjects(
  baseurl: string,
  token: string,
  username: string
) {
  try {
    const jira = new Version3Client({
      host: "https://" + baseurl,
      authentication: {
        basic: {
          email: username,
          apiToken: token,
        },
      },
    });
    // console.log("Jira instance created: ", jira);
    const projects = await jira.projects.searchProjects();
    // console.log("Projects fetched: ", projects);
    const projectArray = projects.values.map((project: any) => ({
      id: project.id,
      name: project.name,
      key: project.key,
    }));
    return projectArray;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}
