"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAllUsers = insertAllUsers;
exports.jiraUserData = jiraUserData;
const csTeam = __importStar(require("../config/customer-success/cs-team"));
const starTeam = __importStar(require("../config/star/star-team"));
const salamTeam = __importStar(require("../config/salam/salam-team"));
const microTeam = __importStar(require("../config/microui/microui-team"));
const vdaTeam = __importStar(require("../config/vda/vda-team"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Main function to insert all team data
async function insertAllUsers() {
    // Insert data for each team with their respective project name
    console.log("inserting user data");
    await jiraUserData(csTeam.customerSuccessTeam, "Customer Success Project");
    await jiraUserData(starTeam.starTeam, "STAR Project");
    await jiraUserData(salamTeam.salamTeam, "SALAM Project");
    await jiraUserData(microTeam.microUiTeam, "Micro UI Project");
    await jiraUserData(vdaTeam.vdaTeam, "VDA Project");
}
// this function is used to insert data
async function jiraUserData(jiraData, projectName) {
    try {
        await prisma.jiraUser.createMany({
            data: jiraData.map(member => ({
                project_name: projectName,
                user_name: member.name,
                jira_id: member.id,
                role: member.role,
            })),
        });
        return { status: "success", message: "Team data inserted successfully" };
    }
    catch (error) {
        console.error("Error inserting team data:", error);
        throw new Error(`Error inserting team data: ${error}`);
    }
}
