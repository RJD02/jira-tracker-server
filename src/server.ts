import { ApolloServer } from "@apollo/server";
import { fetchProjectJiraData } from "./controller/jira-client";
import { getConfig, PROJECT } from "./config/config";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
 
  type JiraResponse {
    expand: String!
    startAt: Int!
    maxResults: Int!
    total: Int!
    issues: [Issue!]!
  }

  type TeamMember {
    name: String!
    id: String!
    role: String!
  }

type Issue {
  expand: String!
  id: ID!
  self: String!
  key: String!
  url: String!
  fields: IssueFields!
}

type IssueFields {
  summary: String!
  issuetype: IssueType!
  parent: ParentIssue
  created: String!
  description: String
  reporter: User!
  priority: Priority!
  labels: [String!]!
  duedate: String
  comment: CommentSection!
  assignee: User
  worklog: Worklog!
  updated: String!
  status: Status!
}

type IssueType {
  self: String!
  id: ID!
  description: String!
  iconUrl: String!
  name: String!
  subtask: Boolean!
  hierarchyLevel: Int!
}

type ParentIssue {
  id: ID!
  key: String!
  self: String!
  fields: ParentIssueFields!
}

type ParentIssueFields {
  summary: String!
  status: Status!
  priority: Priority!
  issuetype: IssueType!
}

type Priority {
  self: String!
  iconUrl: String!
  name: String!
  id: ID!
}

type User {
  self: String!
  accountId: String!
  emailAddress: String
  avatarUrls: AvatarUrls!
  displayName: String!
  active: Boolean!
  timeZone: String!
  accountType: String!
}

type AvatarUrls {
  size48x48: String!
  size24x24: String!
  size16x16: String!
  size32x32: String!
}

type Status {
  self: String!
  description: String!
  iconUrl: String!
  name: String!
  id: ID!
  statusCategory: StatusCategory!
}

type StatusCategory {
  self: String!
  id: Int!
  key: String!
  colorName: String!
  name: String!
}

type CommentSection {
  comments: [Comment!]!
  self: String!
  maxResults: Int!
  total: Int!
  startAt: Int!
}

type Comment {
  self: String!
  id: ID!
  author: User!
  body: String!
  updateAuthor: User!
  created: String!
  updated: String!
  jsdPublic: Boolean!
}

type Worklog {
  startAt: Int!
  maxResults: Int!
  total: Int!
  worklogs: [WorklogEntry!]!
}

type WorklogEntry {
  self: String!
  author: User!
  updateAuthor: User!
  created: String!
  updated: String!
  started: String!
  timeSpent: String!
  timeSpentSeconds: Int!
  id: ID!
}

type JiraCredential {
  protocol: String!
  host: String!
  username: String!
  password: String!
  apiVersion: String!
  strictSSL: Boolean!
}
  enum PROJECT {
  STAR
  SALAM
  CUSTOMER_SUCCESS
  VDA
}

type ProjectItem {
  id: PROJECT!
  label: String!
}

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    issues(project: PROJECT!): JiraResponse
    members(project: PROJECT!): [TeamMember!]!
    projects: [ProjectItem!]!
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    issues(_: any, { project }: { project: PROJECT }) {
      return fetchProjectJiraData(project);
    },
    members(_: any, { project }: { project: PROJECT }) {
      return getConfig(project).team;
    },
    projects() {
      const projects: { id: PROJECT; label: string }[] = [
        { id: "SALAM", label: "Salam" },
        { id: "STAR", label: "Star" },
        { id: "CUSTOMER_SUCCESS", label: "Customer Success" },
        { id: "VDA", label: "VDA" },
      ];
      return projects;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
export const server = new ApolloServer({
  typeDefs,
  resolvers,
});
