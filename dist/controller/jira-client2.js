"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiraDataDb = jiraDataDb;
const config2_1 = require("../config/config2");
async function jiraDataDb(project_name) {
    const { board, credential, team, baseurl } = await (0, config2_1.configuration_db)(project_name);
    console.log(board);
    console.log(credential);
    console.log(team);
    console.log(baseurl);
}
