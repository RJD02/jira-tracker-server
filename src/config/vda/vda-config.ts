import { JiraCredential } from "../../types/types";
export { vdaTeam } from "./vda-team";

export const BASE_URL = process.env.CUSTOMER_SUCCESS_BASE_URL || "url";
export const BOARD = "VDA";

export const vdaCredentials: JiraCredential = {
  protocol: "https",
  host: process.env.CUSTOMER_SUCCESS_HOST || "error",
  username: process.env.CUSTOMER_SUCCESS_USERNAME || "error",
  password: process.env.CUSTOMER_SUCCESS_PASSWORD || "error",
  apiVersion: "2",
  strictSSL: true,
};
