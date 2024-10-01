"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const starConfig = __importStar(require("../config/star/star-config"));
const salamConfig = __importStar(require("../config/salam/salam-config"));
const customerSuccessConfig = __importStar(require("../config/customer-success/cs-config"));
const microUiConfig = __importStar(require("../config/microui/microui-config"));
function getConfig(project) {
    switch (project) {
        case "STAR":
            return {
                baseurl: starConfig.BASE_URL,
                board: starConfig.BOARD,
                credential: starConfig.starCredentials,
                team: starConfig.starTeam,
            };
        case "SALAM":
            return {
                baseurl: salamConfig.BASE_URL,
                credential: salamConfig.salamCredentials,
                team: salamConfig.salamTeam,
            };
        case "CUSTOMER_SUCCESS":
            return {
                baseurl: customerSuccessConfig.BASE_URL,
                credential: customerSuccessConfig.customerSuccessCredentials,
                // board: 'CustomerSucess',
                team: customerSuccessConfig.customerSuccessTeam
            };
        case "MICROUI":
            return {
                baseurl: microUiConfig.BASE_URL,
                credential: microUiConfig.microUiCredentials,
                team: microUiConfig.microUiTeam
            };
    }
    throw new Error("Invalid project");
}
