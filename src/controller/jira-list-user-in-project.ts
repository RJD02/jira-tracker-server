import JiraClient from 'jira-client';
import { PrismaClient, User } from "@prisma/client";

export const prisma = new PrismaClient();


export async function listUsersForProject(baseurl: string, token: string, username: string,userKey: string) {
        try{
        const credentials = `${username}:${token}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');
        const url = `https://${baseurl}/rest/api/3/user/search?query=${userKey}`
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`HTTP error! Status: ${response.status}, ${errorData.message}`);
        }
        
        const data = await response.json();
        const result = data.map((user: { displayName: string; emailAddress: string; accountId: string; active: boolean; }) => ({
            displayName: user.displayName || '', // Use empty string if not present
            emailAddress: user.emailAddress || '', // Use empty string if not present
            accountId: user.accountId || '', // Use empty string if not present
            active: user.active !== undefined ? user.active : '', // Use empty string if not present
        }));
        

        console.log("My results are here", userKey)
        console.log(result);
        return result
     
    }
        catch (error) {
        // Handle errors more gracefully
        console.error('Error fetching users:', error);
        return error;
    }
}
