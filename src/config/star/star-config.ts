import { JiraCredential } from "../../types/types";
export { starTeam } from "./star-team";

export const BASE_URL = process.env.STAR_BASE_URL || "url";
export const BOARD = "Data Lake";

export const starCredentials: JiraCredential = {
  protocol: "https",
  host: process.env.STAR_HOST || "error",
  username: process.env.STAR_USERNAME || "error",
  password: process.env.STAR_PASSWORD || "error",
  apiVersion: "2",
  strictSSL: true,
};
