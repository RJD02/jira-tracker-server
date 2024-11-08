"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server_1 = require("./graphql/server");
const standalone_1 = require("@apollo/server/standalone");
const resolvers_1 = require("./graphql/resolvers");
const port = Number(process.env.PORT) || 5000;
async function start() {
    const { url } = await (0, standalone_1.startStandaloneServer)(server_1.server, {
        // highlight-start
        listen: { port },
        context: async ({ req }) => {
            // get the user token from the headers
            console.log("Building context", req.headers.authorization);
            const token = req.headers.authorization || "";
            console.log(token);
            const user = await (0, server_1.getUserFromToken)(token);
            return { user, prisma: resolvers_1.prisma };
        },
    });
    console.log(`🚀 Server listening at: ${url}`);
}
start().then(() => {
    console.log("Started Server");
});
