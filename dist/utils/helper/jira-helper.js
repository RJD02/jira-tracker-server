"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeamMap = void 0;
exports.resolveCommentUsers = resolveCommentUsers;
exports.resolveUsers = resolveUsers;
exports.jiraRecentActivityFilter = jiraRecentActivityFilter;
const utils_1 = require("../utils");
function resolveCommentUsers(issue, usermap) {
    issue.fields.comment.comments.forEach((comment) => {
        const regex = /\[~accountid:([^\]]+)\]/g;
        comment.body = comment.body?.replace(regex, (_, id) => {
            return "@" + (usermap[id] || id);
        });
    });
}
function resolveUsers(description, usermap) {
    const regex = /\[~accountid:([^\]]+)\]/g;
    return description?.replace(regex, (_, id) => {
        return "@" + (usermap[id] || id);
    });
}
const itemstoClose = `statusCategory in ("In Progress", "To Do")`; //issuetype in (Story, Bug, Task) and
const currentSprint = `(sprint in openSprints() and statusCategory NOT IN (Done, "To Do"))`; //filter for active sprint
function jiraRecentActivityFilter(teamMembers, board) {
    const [_, businessDayCount] = (0, utils_1.getLastNBusinessDays)(1);
    const recentlyChanged = `updated >=  startOfDay(${Math.max(Math.min(-1 * businessDayCount, -1), -4)})`;
    console.log(businessDayCount, recentlyChanged);
    const developers = teamMembers.filter((member) => member.role === "developer");
    const assignee = `(
   assignee in (${developers.map((member) => member.id).join(",")}) or 
   assignee was in (${developers.map((member) => member.id).join(",")})
   )`;
    const teamFilter = board
        ? `Board[Dropdown] = "${board}" and ${assignee}`
        : assignee;
    const targetWorkItems = ` ${teamFilter} and (${recentlyChanged} or ${currentSprint} or ${itemstoClose})`;
    return targetWorkItems;
}
const createTeamMap = (team) => team.reduce((acc, member) => {
    acc[member.id] = member.name;
    return acc;
}, {});
exports.createTeamMap = createTeamMap;
