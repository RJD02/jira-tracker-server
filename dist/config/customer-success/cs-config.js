"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSuccessCredentials = exports.BASE_URL = exports.customerSuccessTeam = void 0;
var cs_team_1 = require("./cs-team");
Object.defineProperty(exports, "customerSuccessTeam", { enumerable: true, get: function () { return cs_team_1.customerSuccessTeam; } });
exports.BASE_URL = process.env.CUSTOMER_SUCCESS_BASE_URL || "url";
exports.customerSuccessCredentials = {
    protocol: "https",
    host: process.env.CUSTOMER_SUCCESS_HOST || "error",
    username: process.env.CUSTOMER_SUCCESS_USERNAME || "error",
    password: process.env.CUSTOMER_SUCCESS_PASSWORD || "error",
    apiVersion: "2",
    strictSSL: true,
};
