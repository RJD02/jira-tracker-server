import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function listUsersForProject(
  baseurl: string,
  token: string,
  username: string,
  userKey: string
) {
  try {
    const credentials = `${username}:${token}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");
    const url = `https://${baseurl}/rest/api/3/user?accountId=${userKey}`;
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error details:", errorData);
      throw new Error(
        `HTTP error! Status: ${response.status}, ${errorData.message}`
      );
    }

    const data = await response.json();
    // console.log(data);
    // console.log(typeof data);

    // Ensure the result is always an array
    const result = Array.isArray(data)
      ? data.map((user) => ({
          displayName: user.displayName || "",
          emailAddress: user.emailAddress || "",
          accountId: user.accountId || "",
          active: user.active !== undefined ? user.active : "",
        }))
      : [
          {
            displayName: data.displayName || "",
            emailAddress: data.emailAddress || "",
            accountId: data.accountId || "",
            active: data.active !== undefined ? data.active : "",
          },
        ];

    return result;
  } catch (error) {
    // Handle errors more gracefully
    console.error("Error fetching users:", error);
    return [];
  }
}