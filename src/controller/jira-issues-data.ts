import { PrismaClient } from '@prisma/client';
import { Issue, IssueFields, JiraResponse } from '../types/types';
const prisma = new PrismaClient();

export async function fetchingJiraIssues(key: string) {

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


    // Assuming you want to extract the fields data as JSON
    const issueData = existingIssues.map(issue => {
        // Check if fields is not null, then parse it, otherwise set to an empty object
        let fieldsData;
        try {
            // If fields is a non-null string, parse it, otherwise fallback to an empty object
            fieldsData = issue.fields ? JSON.parse(issue.fields) : {};
        } catch (error) {
            console.error(`Error parsing fields for issue ${issue.key}:`, error);
            fieldsData = {}; // fallback to empty object if JSON parsing fails
        }
        // console.log("INSIDE")


        const issues : Issue = {
            expand: '',
            id: issue.id,
            key: issue.key,
            self: issue.id,
            url: `https://${project[0].baseurl.site_url}/browse/${issue.key}`,
            fields: fieldsData
            // fields: {
            //     summary: issue.summary,
            //     issuetype: {
            //         self: fieldsData['issuetype']['self'],
            //         id: fieldsData['issuetype']['id'],
            //         description: fieldsData['issuetype']['description'],
            //         iconUrl: fieldsData['issuetype']['iconUrl'],
            //         name: fieldsData['issuetype']['name'],
            //         subtask: fieldsData['issuetype']['subtask'],
            //         hierarchyLevel: fieldsData['issuetype']['hierarchyLevel']
            //     },
            //     parent: fieldsData?.parent,
            //     created: issue.created_at.toString(),
            //     description: issue.description || '',
            //     reporter: {
            //         self: fieldsData?.reporter?.self,
            //         accountId: fieldsData?.reporter?.accountId,
            //         emailAddress: fieldsData?.reporter?.emailAddress,
            //         avatarUrls: fieldsData?.reporter?.avatarUrls,
            //         displayName: fieldsData?.reporter?.displayName,
            //         active: fieldsData?.reporter?.active,
            //         timeZone: fieldsData?.reporter?.timeZone,
            //         accountType: fieldsData?.reporter?.accountType
            //     },
            //     priority: {
            //         self: fieldsData?.priority?.self,
            //         iconUrl: fieldsData?.priority?.iconUrl,
            //         name: fieldsData?.priority?.name,
            //         id: fieldsData?.priority?.id
            //     },
            //     labels: fieldsData?.lables,
            //     duedate: fieldsData?.duedate || '',
            //     comment: fieldsData?.comment,
            //     worklog: issue.worklog ? JSON.parse(issue.worklog) : null,
            // }
        }
        // console.log(issues.url)
        return issues
        return {
            key: issue.key,
            summary: issue.summary,
            status: issue.status,
            assignee: issue.assignee,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            fields: fieldsData // fields is now safely parsed or set to an empty object
        };
    });



    

    // const issueList: JiraResponse = {
    //     total,
    //     issues: issueData as Issue[],
    //     maxResults: 0,
    //     startAt: 0,
    //     expand: '',
    // }
    // console.log("OUTSIDE")
    // Return project and issue details including the fields
    // console.log(issueData)
    return {
        project: project[0], // Assuming only one project is found
        issues: issueData,
        total: issueData.length
    };
}
