"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetListOfProjects = GetListOfProjects;
const jira_client_1 = __importDefault(require("jira-client"));
async function GetListOfProjects(baseurl, token, username) {
    try {
        const jira = await new jira_client_1.default({
            protocol: 'https',
            host: baseurl,
            username: username,
            password: token,
            apiVersion: '2',
            strictSSL: true
        });
        const projects = await jira.listProjects();
        console.log(projects);
        const projectArray = projects.map((project) => {
            return {
                id: project.self,
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
