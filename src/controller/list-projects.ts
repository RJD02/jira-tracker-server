import JiraClient from 'jira-client';

export async function GetListOfProjects(baseurl: string, token: string, username: string) {
    try {
        const jira = await new JiraClient({
            protocol: 'https',
            host: baseurl,
            username: username,
            password: token,
            apiVersion: '2',
            strictSSL: true
        });
        const projects = await jira.listProjects();
        // console.log(projects);
        const projectArray = projects.map((project) => {
            return {
                id: project.id,
                name: project.name,
                key: project.key
            };
        });

        // console.log('Project Array:', projectArray);
        return projectArray;
    }
    catch (error) {
        console.error('Error fetching projects:', error);

    }
}