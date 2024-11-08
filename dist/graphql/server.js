"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.getUserFromToken = void 0;
const server_1 = require("@apollo/server");
const schema_1 = require("@graphql-tools/schema");
const graphql_middleware_1 = require("graphql-middleware"); // To apply graphql-shield
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const resolvers_1 = require("./resolvers");
const config_1 = require("./config");
const permission_1 = require("./permission");
// Middleware to authenticate user based on token
const getUserFromToken = async (token) => {
    try {
        console.log("inside get user from token", token);
        if (token) {
            //remove Bearer
            token = token.replace("Bearer ", "");
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            console.log(decoded);
            console.log(await resolvers_1.prisma.user.findUnique({ where: { id: decoded.userId } }));
            return await resolvers_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        }
        return null;
    }
    catch (err) {
        console.log(err);
        return null;
    }
};
exports.getUserFromToken = getUserFromToken;
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const typeDefs = fs_1.default.readFileSync(path_1.default.join(__dirname, "schema.graphql"), "utf8");
const schema = (0, schema_1.makeExecutableSchema)({
    typeDefs,
    resolvers: resolvers_1.resolvers,
});
// Apply permissions middleware to the schema
const schemaWithMiddleware = (0, graphql_middleware_1.applyMiddleware)(schema, permission_1.permissions);
exports.server = new server_1.ApolloServer({
    schema: schemaWithMiddleware,
    // typeDefs,
    // resolvers,
});
