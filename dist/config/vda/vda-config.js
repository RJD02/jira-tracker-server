"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vdaCredentials = exports.BOARD = exports.BASE_URL = exports.vdaTeam = void 0;
var vda_team_1 = require("./vda-team");
Object.defineProperty(exports, "vdaTeam", { enumerable: true, get: function () { return vda_team_1.vdaTeam; } });
exports.BASE_URL = process.env.CUSTOMER_SUCCESS_BASE_URL || "url";
exports.BOARD = "VDA";
exports.vdaCredentials = {
    protocol: "https",
    host: process.env.CUSTOMER_SUCCESS_HOST || "error",
    username: process.env.CUSTOMER_SUCCESS_USERNAME || "error",
    password: process.env.CUSTOMER_SUCCESS_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};
