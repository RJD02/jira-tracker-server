import { PrismaClient } from '@prisma/client';
import { Issue } from '../types/types';
import { resolveUsers, resolveCommentUsers, createTeamMap } from '../utils/helper/jira-helper';
import { describe } from 'node:test';
import { configuration_db } from '../config/config';
const prisma = new PrismaClient();


export async function fetchingJiraIssues(key: string) {
    const { board, credential, team, baseurl} = await configuration_db(key);


    // Fetch the project using the label (key)
    const project = await prisma.project2.findMany({
        where: {
            label: key
        },
        include: {
            issues: true, // Include related issues
            baseurl: true
        }
    });
    // console.log(project[0].baseurl.site_url)


    const total = await prisma.project2.count({
        where: {
            label: key
        }
    })

    // If no project is found, handle the error
    if (!project || project.length === 0) {
        console.error("Project not found with the provided key");
        return;
    }

    // Fetch existing issues related to the project
    const existingIssues = await prisma.issue.findMany({
        where: {
            project_id: project[0].id
        }
    });

    // If no issues are found, handle the error
    if (!existingIssues || existingIssues.length === 0) {
        console.error("No issues found for this project");
        return;
    }

    let issues: Issue;

    // Assuming you want to extract the fields data as JSON
    const issueData = existingIssues.map(issue => {
        // Check if fields is not null, then parse it, otherwise set to an empty object
        let fieldsData;
        try {
            // If fields is a non-null string, parse it, otherwise fallback to an empty object
            fieldsData = issue.fields ? JSON.parse(issue.fields) : {};
            issues = {
            expand: '',
            id: issue.id,
            key: issue.key,
            self: issue.id,
            url: `https://${project[0].baseurl.site_url}/browse/${issue.key}`,
            fields: fieldsData
        }
            issues.fields.description = resolveUsers(fieldsData.description, createTeamMap(team));
            issues = resolveCommentUsers(issues,createTeamMap(team));
        } catch (error) {
            console.error(`Error parsing fields for issue ${issue.key}:`, error);
            fieldsData = {}; // fallback to empty object if JSON parsing fails
        }
        // console.log("INSIDE")


        return issues
    });



    
    return {
        project: project[0], // Assuming only one project is found
        issues: issueData,
        total: issueData.length
    };
}
