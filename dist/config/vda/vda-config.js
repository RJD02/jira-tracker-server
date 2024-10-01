"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vdaCredentials = exports.BASE_URL = exports.vdaTeam = void 0;
var vda_team_1 = require("./vda-team");
Object.defineProperty(exports, "vdaTeam", { enumerable: true, get: function () { return vda_team_1.vdaTeam; } });
exports.BASE_URL = process.env.MICROUI_BASE_URL || "url";
exports.vdaCredentials = {
    protocol: "https",
    host: process.env.MICROUI_HOST || "error",
    username: process.env.MICROUI_USERNAME || "error",
    password: process.env.MICROUI_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};
