"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeamMap = void 0;
exports.resolveCommentUsers = resolveCommentUsers;
exports.resolveUsers = resolveUsers;
exports.jiraRecentActivityFilter = jiraRecentActivityFilter;
const utils_1 = require("../utils");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function resolveCommentUsers(issue, usermap) {
    issue.fields.comment.comments.forEach((comment) => {
        const regex = /\[~accountid:([^\]]+)\]/g;
        comment.body = comment.body?.replace(regex, (_, id) => {
            return "@" + (usermap[id] || id);
        });
    });
    return issue;
}
function resolveUsers(description, usermap) {
    const regex = /\[~accountid:([^\]]+)\]/g;
    return description?.replace(regex, (_, id) => {
        return "@" + (usermap[id] || id);
    });
}
const itemstoClose = `statusCategory in ("In Progress", "To Do")`; //issuetype in (Story, Bug, Task) and
const currentSprint = `(sprint in openSprints() and statusCategory NOT IN (Done, "To Do"))`; //filter for active sprint
async function jiraRecentActivityFilter(teamMembers, updatedTime, project, board) {
    const key = await prisma.project2.findUnique({
        where: {
            label: project
        }
    });
    const [_, businessDayCount] = (0, utils_1.getLastNBusinessDays)(1);
    // const recentlyChanged = `updated >=  startOfDay(${Math.max(
    //   Math.min(-1 * businessDayCount, -1),
    //   -4
    // )})`;
    // const indianTime = convertUtcToIndianTime(updatedTime);
    // console.log(indianTime)
    const year = updatedTime.getFullYear();
    const month = String(updatedTime.getMonth() + 1); // Months are zero-indexed
    const day = String(updatedTime.getDate());
    const hours = String(updatedTime.getHours());
    // console.log(hours)
    const minutes = String(updatedTime.getMinutes());
    // console.log(minutes)
    const seconds = String(updatedTime.getSeconds());
    // Create the formatted date and time string
    const formattedDatetime = `${year}-${month}-${day} ${hours}:${minutes}`;
    const recentlyChanged = `updated >= '${formattedDatetime}'`;
    console.log(businessDayCount, recentlyChanged);
    const developers = teamMembers.filter((member) => member.role === "developer");
    const assignee = `(
   assignee in (${developers.map((member) => member.id).join(",")}) or 
   assignee was in (${developers.map((member) => member.id).join(",")})
   )`;
    const teamFilter = board
        ? `Board[Dropdown] = "${board}" and ${assignee}`
        : assignee;
    const targetWorkItems = `(project = ${key?.project_key}) and ${teamFilter} and (${recentlyChanged} or ${currentSprint} or ${itemstoClose})`;
    return targetWorkItems;
}
const createTeamMap = (team) => team.reduce((acc, member) => {
    acc[member.id] = member.name;
    return acc;
}, {});
exports.createTeamMap = createTeamMap;
