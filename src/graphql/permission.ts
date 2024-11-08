// src/permissions.ts
import { rule, shield, allow, deny, not } from "graphql-shield";
import { Context } from "./server";

// Define a rule to check if the user is authenticated
const isAuthenticated = rule({ cache: "contextual" })(
  (parent, args, ctx: Context) => {
    console.log("isAuthenticated is running");
    console.log(ctx.user, !!ctx.user);
    return !!ctx.user; // Returns true if the user is authenticated
  }
);

// Permissions middleware
export const permissions = shield(
  {
    Query: {
      me: isAuthenticated, // The 'me' query requires authentication
      "*": isAuthenticated, // Allow all other queries (or specify others as needed)
    },
    Mutation: {
      login: allow, // Allow login without authentication
      signup: allow, // Allow signup without authentication
      "*": isAuthenticated, // Protect all other mutations by requiring authentication
    },
  },
  {
    fallbackRule: allow, // Deny any operation if no rule is explicitly defined
    allowExternalErrors: true,
  }
);
