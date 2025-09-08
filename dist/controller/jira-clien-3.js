"use strict";
// // import JiraApi from "jira-client";
// // import { JiraResponse, Issue } from "../types/types";
// // // import { getConfig, PROJECT } from "../config/config";
// // import {
// //   jiraRecentActivityFilter,
// //   createTeamMap,
// //   resolveCommentUsers,
// //   resolveUsers,
// // } from "../utils/helper/jira-helper";
// // import { configuration_db } from "../config/config";
// // import { PrismaClient } from "@prisma/client";
// // const prisma = new PrismaClient();
// // //updation code
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProjectJiraData = void 0;
// import fetch from 'node-fetch';
// import { configuration_db } from "../config/config";
// import { PrismaClient } from "@prisma/client";
// import { jiraRecentActivityFilter } from "../utils/helper/jira-helper";
// const prisma = new PrismaClient();
// export const fetchProjectJiraData = async (
//   extractProject: string,
//   last_update_time: Date
// ) => {
//   try {
//     const { board, credential, team, baseurl } = await configuration_db(extractProject);
//     const project_ = await prisma.project2.findFirst({
//       where: { label: extractProject },
//     });
//     if (!project_) throw new Error(`Project not found: ${extractProject}`);
//     // Update the updated_at timestamp
//     await prisma.project2.update({
//       where: { id: project_.id },
//       data: { updated_at: new Date() },
//     });
//     // Prepare your JQL query
//     const jql = await jiraRecentActivityFilter(team, last_update_time, extractProject, board);
//     const maxResults = 50;
//     let startAt = 0;
//     let total = 0;
//     let allIssues: any[] = [];
//     // Define fields you want to fetch
//     const fields = [
//       "id", "comment", "worklog", "key", "summary", "status", "assignee",
//       "updated", "priority", "labels", "issuetype", "reporter",
//       "created", "duedate", "description"
//     ];
//     // Base64 encode credentials for Basic Auth
//     const auth = Buffer.from(`${credential.username}:${credential.password}`).toString('base64');
//     console.log(jql);
//     do {
//       // Build POST body as JSON string
//       const bodyData = JSON.stringify({
//         jql,
//         fields,
//         // maxResults,
//         // startAt,
//         // You can add other optional params if needed:
//         // expand: [],
//         // properties: [],
//         // fieldsByKeys: true,
//       });
//       const url = `${credential.protocol}://${credential.host}/rest/api/3/search/jql`;
//       // Fetch data from Jira using POST
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Basic ${auth}`,
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//         body: bodyData,
//       });
//       console.log(bodyData)
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`);
//       }
//       const data = await response.json();
//       if (data.issues && data.issues.length) {
//         allIssues.push(...data.issues);
//       }
//       total = data.total || 0;
//       startAt += maxResults;
//     } while (startAt < total);
//     console.log("Total issues fetched via POST fetch():", allIssues.length);
//     // console.log(allIssues)
//     return allIssues;
//   } catch (error: any) {
//     console.error("Error fetching Jira issues with POST fetch:", error.message || error);
//     throw error;
//   }
// };
// fetchProjectJiraData("NPM",new Date("2025-09-05T16:00:00.000Z"))
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = require("../config/config");
const client_1 = require("@prisma/client");
const jira_helper_1 = require("../utils/helper/jira-helper");
const prisma = new client_1.PrismaClient();
const fetchProjectJiraData = async (extractProject, last_update_time) => {
    try {
        const { board, credential, team, baseurl } = await (0, config_1.configuration_db)(extractProject);
        const project_ = await prisma.project2.findFirst({
            where: { label: extractProject },
        });
        if (!project_)
            throw new Error(`Project not found: ${extractProject}`);
        await prisma.project2.update({
            where: { id: project_.id },
            data: { updated_at: new Date() },
        });
        const jql = await (0, jira_helper_1.jiraRecentActivityFilter)(team, last_update_time, extractProject, board);
        const fields = [
            "id", "comment", "worklog", "key", "summary", "status", "assignee",
            "updated", "priority", "labels", "issuetype", "reporter",
            "created", "duedate", "description"
        ];
        const auth = Buffer.from(`${credential.username}:${credential.password}`).toString('base64');
        const url = `${credential.protocol}://${credential.host}/rest/api/3/search/jql`;
        let nextPageToken = null;
        let isLast = false;
        let allIssues = [];
        console.log(jql);
        do {
            const bodyData = {
                jql,
                fields,
            };
            if (nextPageToken) {
                bodyData.nextPageToken = nextPageToken;
            }
            const response = await (0, node_fetch_1.default)(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            if (data.issues && data.issues.length) {
                allIssues.push(...data.issues);
            }
            isLast = data.isLast ?? true; // default to true if missing
            nextPageToken = data.nextPageToken ?? null;
        } while (!isLast && nextPageToken);
        console.log("Total issues fetched:", allIssues.length);
        const issuesToTrack = { issues: allIssues, total: allIssues.length };
        // Fetch worklogs in parallel for batch size (specific to 'salam' project)
        if (extractProject.toLocaleLowerCase() === "salam") {
            const BATCH_SIZE = 15;
            const fetchWorklogsInBatches = async (issues) => {
                for (let i = 0; i < issues.length; i += BATCH_SIZE) {
                    const batch = issues.slice(i, i + BATCH_SIZE);
                    const worklogPromises = batch.map(async (issue) => {
                        const worklogs = await (0, node_fetch_1.default)(`${credential.protocol}://${credential.host}/rest/api/3/issue/${issue.id}/worklog`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Basic ${auth}`,
                                'Accept': 'application/json',
                            },
                        }).then((res) => res.json());
                        issue.fields.worklog = worklogs;
                        return issue;
                    });
                    await Promise.all(worklogPromises);
                }
            };
            await fetchWorklogsInBatches(issuesToTrack.issues);
        }
        // Map the issues to Prisma format and include project_id
        const issueDataToInsert = issuesToTrack.issues.map((issue) => {
            console.log(typeof issue.self, "issue.self", issue.self);
            console.log(typeof issue.key, "issue.key", issue.key);
            console.log(typeof issue.fields.summary, "issue.fields.summary", issue.fields.summary);
            console.log(typeof issue.fields.status?.statusCategory?.name || "", "issue.fields.status?.statusCategory?.name", issue.fields.status?.statusCategory?.name || "");
            console.log(typeof issue.fields.assignee?.displayName || "", "issue.fields.assignee?.displayName", issue.fields.assignee?.displayName || "");
            console.log(typeof new Date(issue.fields.created), "new Date(issue.fields.created)", new Date(issue.fields.created));
            console.log(typeof issue.fields.issuetype.description || "", "issue.fields.issuetype.description", issue.fields.issuetype.description || "");
            console.log(typeof JSON.stringify(issue.fields.worklog) || "", "JSON.stringify(issue.fields.worklog)", JSON.stringify(issue.fields.worklog) || "");
            console.log(typeof JSON.stringify(issue.fields) || "", "issue.fields", JSON.stringify(issue.fields) || "");
            console.log(typeof project_.id, "project_.id", project_.id);
            console.log("\n\n");
            return {
                id: issue.self,
                key: issue.key,
                summary: issue.fields.summary,
                status: issue.fields.status?.statusCategory?.name || "",
                assignee: issue.fields.assignee?.displayName || "",
                updated_at: new Date(),
                created_at: new Date(issue.fields.created),
                description: issue.fields.issuetype.description || "",
                worklog: JSON.stringify(issue.fields.worklog) || "",
                fields: JSON.stringify(issue.fields) || "",
                project_id: project_.id,
            };
        });
        // Retrieve existing issues from the database based on keys
        const existingIssues = await prisma.issue.findMany({
            where: {
                key: { in: issueDataToInsert.map((issue) => issue.key) },
            },
        });
        const existingIssueKeys = new Set(existingIssues.map((issue) => issue.key));
        // Split issues into new and updated
        const newIssues = issueDataToInsert.filter((issue) => !existingIssueKeys.has(issue.key));
        const updatedIssues = issueDataToInsert.filter((issue) => existingIssueKeys.has(issue.key) &&
            existingIssues.some((existingIssue) => existingIssue.key === issue.key &&
                new Date().getTime() -
                    new Date(existingIssue.updated_at).getTime() >=
                    2 * 60 * 1000 // 30 minutes
            ));
        // Insert new issues into the database
        if (newIssues.length > 0) {
            await prisma.issue.createMany({
                data: newIssues,
            });
        }
        // Update existing issues if necessary
        const updatePromises = updatedIssues.map((issue) => prisma.issue.update({
            where: { id: issue.id },
            data: issue,
        }));
        // Wait for all update operations to complete
        await Promise.all(updatePromises);
        // Add URL and resolve users if needed
        issuesToTrack.issues.forEach((issue) => {
            issue.url = `${baseurl}/browse/${issue.key}`;
            issue.fields.issuetype.description = (0, jira_helper_1.resolveUsers)(issue.fields.issuetype.description, (0, jira_helper_1.createTeamMap)(team));
            (0, jira_helper_1.resolveCommentUsers)(issue, (0, jira_helper_1.createTeamMap)(team));
        });
        console.log("Total issues processed:", issuesToTrack.issues.length);
        return issuesToTrack;
    }
    catch (error) {
        console.error("Error fetching Jira issues:", error.message || error);
        throw error;
    }
};
exports.fetchProjectJiraData = fetchProjectJiraData;
// Run the function
(0, exports.fetchProjectJiraData)("NPM", new Date("2025-09-05T00:00:00.000Z"));
