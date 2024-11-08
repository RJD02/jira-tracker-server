import { TeamMember } from "../../types/team";
import { Issue } from "../../types/types";
import { getLastNBusinessDays } from "../utils";

export function resolveCommentUsers(
  issue: Issue,
  usermap: Record<string, string>
) {
  issue.fields.comment.comments.forEach((comment) => {
    const regex = /\[~accountid:([^\]]+)\]/g;
    comment.body = comment.body?.replace(regex, (_, id) => {
      return "@" + (usermap[id] || id);
    });
  });
}

export function resolveUsers(
  description: string,
  usermap: Record<string, string>
) {
  const regex = /\[~accountid:([^\]]+)\]/g;
  return description?.replace(regex, (_, id) => {
    return "@" + (usermap[id] || id);
  });
}

const itemstoClose = `statusCategory in ("In Progress", "To Do")`; //issuetype in (Story, Bug, Task) and
const currentSprint = `(sprint in openSprints() and statusCategory NOT IN (Done, "To Do"))`; //filter for active sprint

export function jiraRecentActivityFilter(
  teamMembers: TeamMember[],
  board?: string
) {
  const [_, businessDayCount] = getLastNBusinessDays(1);
  const recentlyChanged = `updated >=  startOfDay(${Math.max(
    Math.min(-1 * businessDayCount, -1),
    -4
  )})`;
  console.log(businessDayCount, recentlyChanged);

  const developers = teamMembers.filter(
    (member) => member.role === "developer"
  );
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

export const createTeamMap = (team: TeamMember[]) =>
  team.reduce((acc, member) => {
    acc[member.id] = member.name;
    return acc;
  }, {} as { [key: string]: string });
