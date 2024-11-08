"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.microUiCredentials = exports.BOARD = exports.BASE_URL = exports.microUiTeam = void 0;
var microui_team_1 = require("./microui-team");
Object.defineProperty(exports, "microUiTeam", { enumerable: true, get: function () { return microui_team_1.microUiTeam; } });
exports.BASE_URL = process.env.MICROUI_BASE_URL || "url";
exports.BOARD = 'build-tools';
exports.microUiCredentials = {
    protocol: "https",
    host: process.env.MICROUI_HOST || "error",
    username: process.env.MICROUI_USERNAME || "error",
    password: process.env.MICROUI_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};
