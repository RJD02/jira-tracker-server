"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJiraData = void 0;
const jira_client_1 = __importDefault(require("jira-client"));
const config_1 = require("../config/config");
const jira_helper_1 = require("../utils/helper/jira-helper");
const isValidProject = (val) => {
    return ["SALAM", "STAR", "CUSTOMER_SUCCESS", 'MICROUI'].includes(val.toUpperCase());
};
const fetchJiraData = async (req, res) => {
    const extractProject = req.url.split("/")[1].toUpperCase();
    const project = isValidProject(extractProject)
        ? extractProject
        : "SALAM";
    const { board, credential, team } = (0, config_1.getConfig)(project);
    let issuesToTrack = null;
    var jira = new jira_client_1.default(credential);
    try {
        const filter = (0, jira_helper_1.jiraRecentActivityFilter)(team, board);
        issuesToTrack = (await jira.searchJira(filter, {
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
        }));
        if (project === "SALAM") {
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
            issue.fields.description = (0, jira_helper_1.resolveUsers)(issue.fields.description, (0, jira_helper_1.createTeamMap)(team));
            (0, jira_helper_1.resolveCommentUsers)(issue, (0, jira_helper_1.createTeamMap)(team));
        });
        res.json({ data: issuesToTrack });
        // return issuesToTrack;
    }
    catch (error) {
        console.log(error);
        res.json({ error: error.message });
        // return { error: error.message };
    }
};
exports.fetchJiraData = fetchJiraData;
/*
        const fetchData = async () => {

            let issuesToTrack: JiraResponse | null = null;
            var jira = new JiraApi(credential);
            try {
                const filter = jiraRecentActivityFilter(team, board);
                issuesToTrack = (await jira.searchJira(filter, {
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
                })) as JiraResponse;

                //extract worklogs for each issues
                //
                if (project === "SALAM") {
                    //Perform 5 requests in parallel
                    const BATCH_SIZE = 15;
                    const fetchWorklogsInBatches = async (issues: Issue[]) => {
                        for (let i = 0; i < issues.length; i += BATCH_SIZE) {
                            // Slice the issues into batches of 5
                            const batch = issues.slice(i, i + BATCH_SIZE);

                            // Create an array of promises for fetching worklogs in parallel
                            const worklogPromises = batch.map(async (issue) => {
                                const worklogs = await jira.getIssueWorklogs(issue.id);
                                issue.fields.worklog = worklogs as any;
                                return issue;
                            });

                            // Wait for all promises in this batch to resolve
                            await Promise.all(worklogPromises);
                        }
                    };
                    await fetchWorklogsInBatches(issuesToTrack.issues);
                }
                issuesToTrack.issues.forEach((issue) =>
                    resolveCommentUsers(issue, createTeamMap(team))
                );

                // return issuesToTrack;
                setData(issuesToTrack)
            } catch (error: any) {
                console.log(error);
                // return { error: error.message };
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

    }, [project])

    return { data, loading, error }
 
*/
