"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchingJiraIssues = fetchingJiraIssues;
const client_1 = require("@prisma/client");
const jira_helper_1 = require("../utils/helper/jira-helper");
const config_1 = require("../config/config");
const prisma = new client_1.PrismaClient();
// Helper function to extract plain text from Atlassian Document Format (ADF)
function extractTextFromADF(adfContent) {
    if (!adfContent || !adfContent.content) {
        return "";
    }
    let text = "";
    function traverse(node) {
        if (node.type === "text") {
            text += node.text || "";
        }
        else if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse);
        }
        // Add line breaks for certain block elements
        if (node.type === "paragraph" || node.type === "heading") {
            text += "\n";
        }
    }
    adfContent.content.forEach(traverse);
    return text.trim();
}
async function fetchingJiraIssues(key) {
    const { board, credential, team, baseurl } = await (0, config_1.configuration_db)(key);
    // Fetch the project using the label (key)
    const project = await prisma.project2.findMany({
        where: {
            label: key,
        },
        include: {
            issues: true, // Include related issues
            baseurl: true,
        },
    });
    const total = await prisma.project2.count({
        where: {
            label: key,
        },
    });
    // If no project is found, handle the error
    if (!project || project.length === 0) {
        console.error("Project not found with the provided key");
        return;
    }
    // Fetch existing issues related to the project
    const existingIssues = await prisma.issue.findMany({
        where: {
            project_id: project[0].id,
        },
    });
    // If no issues are found, handle the error
    if (!existingIssues || existingIssues.length === 0) {
        console.error("No issues found for this project");
        return;
    }
    let issues;
    // Assuming you want to extract the fields data as JSON
    const issueData = existingIssues.map((issue) => {
        // Check if fields is not null, then parse it, otherwise set to an empty object
        let fieldsData;
        try {
            // If fields is a non-null string, parse it, otherwise fallback to an empty object
            fieldsData = issue.fields ? JSON.parse(issue.fields) : {};
            issues = {
                expand: "",
                id: issue.id,
                key: issue.key,
                self: issue.id,
                url: `https://${project[0].baseurl.site_url}/browse/${issue.key}`,
                fields: fieldsData,
            };
            if (issue.worklog === null ||
                issue.worklog === undefined ||
                issue.worklog === "") {
                issue.worklog = fieldsData.worklog;
            }
            // Handle description field - it can be either string or ADF object
            let descriptionText = "";
            if (fieldsData.description) {
                if (typeof fieldsData.description === "string") {
                    // Legacy string format
                    descriptionText = fieldsData.description;
                }
                else if (typeof fieldsData.description === "object" && fieldsData.description.content) {
                    // New ADF (Atlassian Document Format) object
                    descriptionText = extractTextFromADF(fieldsData.description);
                }
            }
            // Apply user resolution to the extracted text
            issues.fields.description = (0, jira_helper_1.resolveUsers)(descriptionText, (0, jira_helper_1.createTeamMap)(team));
            issues = (0, jira_helper_1.resolveCommentUsers)(issues, (0, jira_helper_1.createTeamMap)(team));
        }
        catch (error) {
            console.error(`Error parsing fields for issue ${issue.key}:`, error);
            fieldsData = {}; // fallback to empty object if JSON parsing fails
        }
        return issues;
    });
    return {
        project: project[0], // Assuming only one project is found
        issues: issueData,
        total: issueData.length,
    };
}
