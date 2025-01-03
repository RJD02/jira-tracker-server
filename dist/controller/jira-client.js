"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProjectJiraData = void 0;
const jira_client_1 = __importDefault(require("jira-client"));
// import { getConfig, PROJECT } from "../config/config";
const jira_helper_1 = require("../utils/helper/jira-helper");
const config_1 = require("../config/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//updation code
const fetchProjectJiraData = async (extractProject, last_update_time) => {
    const { board, credential, team, baseurl } = await (0, config_1.configuration_db)(extractProject); // Assuming project_id is fetched here
    const project_ = await prisma.project2.findMany({
        where: {
            label: extractProject
        }
    });
    console.log(project_[0].id);
    const project_id = project_[0].id;
    let issuesToTrack = null;
    const jira = new jira_client_1.default(credential);
    try {
        const filter = (0, jira_helper_1.jiraRecentActivityFilter)(team, last_update_time, extractProject, board);
        let totalLoaded = 0;
        do {
            const records = (await jira.searchJira(await filter, {
                fields: [
                    "id",
                    "comment",
                    "worklog",
                    "key",
                    "summary",
                    "status",
                    "assignee",
                    "updated",
                    "priority",
                    "labels",
                    "issuetype",
                    "reporter",
                    "created",
                    "duedate",
                    "description",
                    "parent",
                    "statusCategory",
                ],
                maxResults: 150,
                startAt: totalLoaded,
            }));
            if (!issuesToTrack) {
                issuesToTrack = records;
            }
            else {
                issuesToTrack.issues.push(...records.issues);
                issuesToTrack.maxResults += records.issues.length;
            }
            totalLoaded += records.issues.length;
        } while (totalLoaded < issuesToTrack.total);
        // Fetch worklogs in parallel for batch size
        if (extractProject.toLocaleLowerCase() === "salam") {
            console.log("Extracting Worklogs");
            const BATCH_SIZE = 15;
            const fetchWorklogsInBatches = async (issues) => {
                for (let i = 0; i < issues.length; i += BATCH_SIZE) {
                    const batch = issues.slice(i, i + BATCH_SIZE);
                    const worklogPromises = batch.map(async (issue) => {
                        const worklogs = await jira.getIssueWorklogs(issue.id);
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
            return {
                id: issue.self,
                key: issue.key,
                summary: issue.fields.summary,
                status: issue.fields.status?.statusCategory?.name || '',
                assignee: issue.fields.assignee?.displayName || '',
                updated_at: new Date(),
                created_at: new Date(issue.fields.created),
                description: issue.fields.description || '',
                worklog: JSON.stringify(issue.fields.worklog) || '',
                fields: JSON.stringify(issue.fields) || '', // You may want to adjust what fields you store here
                project_id: project_id, // Add the project_id here
            };
        });
        // Retrieve existing issues from the database based on keys
        const existingIssues = await prisma.issue.findMany({
            where: {
                key: { in: issueDataToInsert.map(issue => issue.key) },
            },
        });
        const existingIssueKeys = new Set(existingIssues.map(issue => issue.key));
        // Split issues into new and updated
        const newIssues = issueDataToInsert.filter(issue => !existingIssueKeys.has(issue.key));
        const updatedIssues = issueDataToInsert.filter(issue => existingIssueKeys.has(issue.key) &&
            // Check if updated_at is older than 30 minutes
            existingIssues.some(existingIssue => existingIssue.key === issue.key &&
                (new Date().getTime() - new Date(existingIssue.updated_at).getTime()) >= 2 * 60 * 1000 // 30 minutes
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
            issue.fields.description = (0, jira_helper_1.resolveUsers)(issue.fields.description, (0, jira_helper_1.createTeamMap)(team));
            (0, jira_helper_1.resolveCommentUsers)(issue, (0, jira_helper_1.createTeamMap)(team));
        });
        return issuesToTrack;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
exports.fetchProjectJiraData = fetchProjectJiraData;
