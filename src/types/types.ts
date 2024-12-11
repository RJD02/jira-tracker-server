export interface JiraResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: Issue[];
}

export interface Issue {
  expand: string;
  id: string;
  self: string;
  key: string;
  url: string;
  fields: IssueFields;
}

export interface IssueFields {
  summary: string;
  issuetype: IssueType;
  parent?: ParentIssue;
  created: string;
  description: string;
  reporter: User;
  priority: Priority;
  labels: string[];
  duedate: string;
  comment: CommentSection;
  assignee?: User;
  worklog: Worklog;
  updated: string;
  status: Status;
}
interface IssueType {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  hierarchyLevel: number;
}
interface ParentIssue {
  id: string;
  key: string;
  self: string;
  fields: ParentIssueFields;
}
interface ParentIssueFields {
  summary: string;
  status: Status;
  priority: Priority;
  issuetype: IssueType;
}
interface Priority {
  self: string;
  iconUrl: string;
  name: string;
  id: string;
}
interface User {
  self: string;
  accountId: string;
  emailAddress: string;
  avatarUrls: AvatarUrls;
  displayName: string;
  active: boolean;
  timeZone: string;
  accountType: string;
}
interface AvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}
interface Status {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: StatusCategory;
}
interface StatusCategory {
  self: string;
  id: number;
  key: string;
  colorName: string;
  name: string;
}
interface CommentSection {
  comments: Comment[];
  self: string;
  maxResults: number;
  total: number;
  startAt: number;
}
interface Comment {
  self: string;
  id: string;
  author: User;
  body: string;
  updateAuthor: User;
  created: string;
  updated: string;
  jsdPublic: boolean;
}
interface Worklog {
  startAt: number;
  maxResults: number;
  total: number;
  worklogs: WorklogEntry[];
}
interface WorklogEntry {
  self: string;
  author: User;
  updateAuthor: User;
  created: string;
  updated: string;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  id: string;
}

export interface JiraCredential {
  protocol: string;
  host: string;
  username: string;
  password: string;
  apiVersion: string;
  strictSSL: boolean;
}
