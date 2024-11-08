import { JiraCredential } from "../../types/types";
export { microUiTeam } from "./microui-team";

export const BASE_URL = process.env.MICROUI_BASE_URL || "url";
export const BOARD = 'build-tools'

export const microUiCredentials: JiraCredential = {
    protocol: "https",
    host: process.env.MICROUI_HOST || "error",
    username: process.env.MICROUI_USERNAME || "error",
    password:
        process.env.MICROUI_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};


