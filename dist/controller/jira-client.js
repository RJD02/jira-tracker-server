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
// const isValidProject = (val: string): val is PROJECT => {
//     return ["SALAM", "STAR", "CUSTOMER_SUCCESS", 'VDA'].includes(val.toUpperCase());
// };
// export const fetchJiraData = async (req: Request, res: Response) => {
//     const extractProject = req.url.split("/")[1].toUpperCase();
//     const project: PROJECT = isValidProject(extractProject)
//         ? extractProject
//         : "SALAM";
//     const { board, credential, team } = getConfig(project);
//     // const { board, credential, team } = await configuration_db(project);
//     let issuesToTrack: JiraResponse | null = null;
//     var jira = new JiraApi(credential);
//     try {
//         const filter = jiraRecentActivityFilter(team, board);
//         issuesToTrack = (await jira.searchJira(filter, {
//             fields: [
//                 "id",
//                 "comment",
//                 "worklog",
//                 "key",
//                 "summary",
//                 "status",
//                 "assignee",
//                 "updated",
//                 "priority",
//                 "labels",
//                 "issuetype",
//                 "reporter",
//                 "created",
//                 "duedate",
//                 "description",
//                 "parent",
//                 "statusCategory",
//             ],
//             expand: [""],
//             maxResults: 150,
//         })) as JiraResponse;
//         if (project === "SALAM") {
//             //Perform 5 requests in parallel
//             const BATCH_SIZE = 15;
//             const fetchWorklogsInBatches = async (issues: Issue[]) => {
//                 for (let i = 0; i < issues.length; i += BATCH_SIZE) {
//                     // Slice the issues into batches of 5
//                     const batch = issues.slice(i, i + BATCH_SIZE);
//                     // Create an array of promises for fetching worklogs in parallel
//                     const worklogPromises = batch.map(async (issue) => {
//                         const worklogs = await jira.getIssueWorklogs(issue.id);
//                         issue.fields.worklog = worklogs as any;
//                         return issue;
//                     });
//                     // Wait for all promises in this batch to resolve
//                     await Promise.all(worklogPromises);
//                 }
//             };
//             await fetchWorklogsInBatches(issuesToTrack.issues);
//         }
//         issuesToTrack.issues.forEach((issue) => {
//             issue.fields.description = resolveUsers(
//                 issue.fields.description,
//                 createTeamMap(team)
//             );
//             resolveCommentUsers(issue, createTeamMap(team));
//         });
//         res.json({ data: issuesToTrack });
//         // return issuesToTrack;
//     } catch (error: any) {
//         console.log(error);
//         res.json({ error: error.message });
//         // return { error: error.message };
//     }
// };
const fetchProjectJiraData = async (extractProject) => {
    // console.log(extractProject)
    // const project: PROJECT = isValidProject(extractProject.toUpperCase())
    //     ? (extractProject as PROJECT)
    //     : "SALAM";
    // console.log("here we are")
    const { board, credential, team, baseurl } = await (0, config_1.configuration_db)(extractProject);
    // console.log(team)
    // const { board, credential, team, baseurl } = getConfig(project);
    let issuesToTrack = null;
    var jira = new jira_client_1.default(credential);
    try {
        const filter = (0, jira_helper_1.jiraRecentActivityFilter)(team, board);
        let totalLoaded = 0;
        do {
            const records = (await jira.searchJira(filter, {
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
                expand: [""],
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
        if (extractProject === "SALAM") {
            //Perform 5 requests in parallel
            const BATCH_SIZE = 15;
            const fetchWorklogsInBatches = async (issues) => {
                for (let i = 0; i < issues.length; i += BATCH_SIZE) {
                    // Slice the issues into batches of 5
                    const batch = issues.slice(i, i + BATCH_SIZE);
                    // Create an array of promises for fetching worklogs in parallel
                    const worklogPromises = batch.map(async (issue) => {
                        const worklogs = await jira.getIssueWorklogs(issue.id);
                        issue.fields.worklog = worklogs;
                        return issue;
                    });
                    // Wait for all promises in this batch to resolve
                    await Promise.all(worklogPromises);
                }
            };
            await fetchWorklogsInBatches(issuesToTrack.issues);
        }
        issuesToTrack.issues.forEach((issue) => {
            issue.url = `${baseurl}/browse/${issue.key}`;
            issue.fields.description = (0, jira_helper_1.resolveUsers)(issue.fields.description, (0, jira_helper_1.createTeamMap)(team));
            (0, jira_helper_1.resolveCommentUsers)(issue, (0, jira_helper_1.createTeamMap)(team));
        });
        return issuesToTrack;
        // res.json({ data: issuesToTrack });
    }
    catch (error) {
        console.log(error);
        throw error;
        //res.json({ error: error.message });
    }
};
exports.fetchProjectJiraData = fetchProjectJiraData;
