"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
// src/permissions.ts
const graphql_shield_1 = require("graphql-shield");
// Define a rule to check if the user is authenticated
const isAuthenticated = (0, graphql_shield_1.rule)({ cache: "contextual" })((parent, args, ctx) => {
    console.log("isAuthenticated is running");
    console.log(ctx.user, !!ctx.user);
    return !!ctx.user; // Returns true if the user is authenticated
});
// Permissions middleware
exports.permissions = (0, graphql_shield_1.shield)({
    Query: {
        me: isAuthenticated, // The 'me' query requires authentication
        "*": isAuthenticated, // Allow all other queries (or specify others as needed)
    },
    Mutation: {
        login: graphql_shield_1.allow, // Allow login without authentication
        signup: graphql_shield_1.allow, // Allow signup without authentication
        "*": isAuthenticated, // Protect all other mutations by requiring authentication
    },
}, {
    fallbackRule: graphql_shield_1.allow, // Deny any operation if no rule is explicitly defined
    allowExternalErrors: true,
});
