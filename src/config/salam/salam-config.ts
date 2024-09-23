import { JiraCredential } from "../../types/types";
export { salamTeam } from "./salam-team";

export const BASE_URL = process.env.SALAM_BASE_URL || "url";
export const salamCredentials: JiraCredential = {
    protocol: "https",
    host: process.env.SALAM_HOST || "error",
    username: process.env.SALAM_USERNAME || "error",
    password:
        process.env.SALAM_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};


