"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetListOfProjects = GetListOfProjects;
// import JiraClient from "jira-client";
const jira_js_1 = require("jira.js");
// const { Version3Client } =  import('jira.js');
async function GetListOfProjects(baseurl, token, username) {
    try {
        const jira = new jira_js_1.Version3Client({
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
        const projectArray = projects.values.map((project) => ({
            id: project.id,
            name: project.name,
            key: project.key,
        }));
        return projectArray;
    }
    catch (error) {
        console.error("Error fetching projects:", error);
    }
}
