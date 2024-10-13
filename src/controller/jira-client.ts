import { Request, Response } from "express";
import JiraApi from "jira-client";
import { JiraResponse, Issue } from "../types/types";
import { getConfig, PROJECT } from "../config/config";
import {
    jiraRecentActivityFilter,
    createTeamMap,
    resolveCommentUsers,
    resolveUsers,
} from "../utils/helper/jira-helper";

const isValidProject = (val: string): val is PROJECT => {
    return ["SALAM", "STAR", "CUSTOMER_SUCCESS", 'VDA'].includes(val.toUpperCase());
};

export const fetchJiraData = async (req: Request, res: Response) => {
    const extractProject = req.url.split("/")[1].toUpperCase();
    const project: PROJECT = isValidProject(extractProject)
        ? extractProject
        : "SALAM";
    const { board, credential, team } = getConfig(project);
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
        issuesToTrack.issues.forEach((issue) => {
            issue.fields.description = resolveUsers(
                issue.fields.description,
                createTeamMap(team)
            );
            resolveCommentUsers(issue, createTeamMap(team));
        });

        res.json({ data: issuesToTrack });
        // return issuesToTrack;
    } catch (error: any) {
        console.log(error);
        res.json({ error: error.message });
        // return { error: error.message };
    }
};

export const fetchProjectJiraData = async (extractProject: string) => {
    const project: PROJECT = isValidProject(extractProject.toUpperCase())
        ? (extractProject as PROJECT)
        : "SALAM";
    const { board, credential, team, baseurl } = getConfig(project);
    let issuesToTrack: JiraResponse | null = null;
    var jira = new JiraApi(credential);

    try {
        const filter = jiraRecentActivityFilter(team, board);
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
            })) as JiraResponse;

            if (!issuesToTrack) {
                issuesToTrack = records;
            } else {
                issuesToTrack.issues.push(...records.issues);
                issuesToTrack.maxResults += records.issues.length;
            }
            totalLoaded += records.issues.length;
        } while (totalLoaded < issuesToTrack.total);

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

        issuesToTrack.issues.forEach((issue) => {
            issue.url = `${baseurl}/browse/${issue.key}`;

            issue.fields.description = resolveUsers(
                issue.fields.description,
                createTeamMap(team)
            );
            resolveCommentUsers(issue, createTeamMap(team));
        });

        return issuesToTrack;
        // res.json({ data: issuesToTrack });
    } catch (error: any) {
        console.log(error);
        throw error;
        //res.json({ error: error.message });
    }
};
