"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.listUsersForProject = listUsersForProject;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function listUsersForProject(baseurl, token, username, userKey) {
    try {
        const credentials = `${username}:${token}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');
        const url = `https://${baseurl}/rest/api/3/user/search?query=${userKey}`;
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
        const result = data.map((user) => ({
            displayName: user.displayName || '', // Use empty string if not present
            emailAddress: user.emailAddress || '', // Use empty string if not present
            accountId: user.accountId || '', // Use empty string if not present
            active: user.active !== undefined ? user.active : '', // Use empty string if not present
        }));
        console.log("My results are here", userKey);
        console.log(result);
        return result;
    }
    catch (error) {
        // Handle errors more gracefully
        console.error('Error fetching users:', error);
        return error;
    }
}
