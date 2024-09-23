"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salamCredentials = exports.BASE_URL = exports.salamTeam = void 0;
var salam_team_1 = require("./salam-team");
Object.defineProperty(exports, "salamTeam", { enumerable: true, get: function () { return salam_team_1.salamTeam; } });
exports.BASE_URL = process.env.SALAM_BASE_URL || "url";
exports.salamCredentials = {
    protocol: "https",
    host: process.env.SALAM_HOST || "error",
    username: process.env.SALAM_USERNAME || "error",
    password: process.env.SALAM_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};
