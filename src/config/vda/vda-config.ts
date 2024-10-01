import { JiraCredential } from "../../types/types";
export { vdaTeam } from "./vda-team";

export const BASE_URL = process.env.MICROUI_BASE_URL || "url";
export const vdaCredentials: JiraCredential = {
  protocol: "https",
  host: process.env.MICROUI_HOST || "error",
  username: process.env.MICROUI_USERNAME || "error",
  password: process.env.MICROUI_PASSWORD || "error",
  apiVersion: "2",
  strictSSL: true,
};
