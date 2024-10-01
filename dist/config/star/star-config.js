"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.starCredentials = exports.BOARD = exports.BASE_URL = exports.starTeam = void 0;
var star_team_1 = require("./star-team");
Object.defineProperty(exports, "starTeam", { enumerable: true, get: function () { return star_team_1.starTeam; } });
exports.BASE_URL = process.env.STAR_BASE_URL || "url";
exports.BOARD = "Data Lake";
exports.starCredentials = {
    protocol: "https",
    host: process.env.STAR_HOST || "error",
    username: process.env.STAR_USERNAME || "error",
    password: process.env.STAR_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};
