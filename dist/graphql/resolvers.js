"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.prisma = void 0;
const config_1 = require("../config/config");
const jira_client_1 = require("../controller/jira-client");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_2 = require("./config");
exports.prisma = new client_1.PrismaClient();
exports.resolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.user) {
                throw new Error("Not authenticated");
            }
            return context.user;
        },
        issues(_, { project }) {
            console.log("Resolver is running");
            return (0, jira_client_1.fetchProjectJiraData)(project);
        },
        members(_, { project }) {
            return (0, config_1.getConfig)(project).team;
        },
        projects() {
            const projects = [
                { id: "SALAM", label: "Salam" },
                { id: "STAR", label: "Star" },
                { id: "CUSTOMER_SUCCESS", label: "Customer Success" },
                { id: "VDA", label: "VDA" },
            ];
            return projects;
        },
    },
    Mutation: {
        signup: async (_, { username, password }) => {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await exports.prisma.user.create({
                data: { username, password: hashedPassword },
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_2.JWT_SECRET);
            return {
                token,
                user,
            };
        },
        login: async (_, { username, password }, { prisma, user: u }) => {
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user) {
                throw new Error("No user found with that username");
            }
            const valid = await bcryptjs_1.default.compare(password, user.password);
            if (!valid) {
                throw new Error("Invalid password");
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_2.JWT_SECRET);
            console.log({
                token,
                user,
            });
            return {
                token,
                user,
            };
        },
    },
};
