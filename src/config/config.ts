import { JiraCredential } from "../types/types";
import * as starConfig from "../config/star/star-config";
import * as salamConfig from "../config/salam/salam-config";
import * as customerSuccessConfig from '../config/customer-success/cs-config'
import * as microUiConfig from '../config/microui/microui-config'

import { TeamMember } from "../types/team";

interface Config {
    baseurl: string;
    board?: string;
    credential: JiraCredential;
    team: TeamMember[];
}
export type PROJECT = "STAR" | "SALAM" | "CUSTOMER_SUCCESS" | 'MICROUI';

export function getConfig(project: PROJECT): Config {
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
            }
        case "MICROUI":
            return {
                baseurl: microUiConfig.BASE_URL,
                credential: microUiConfig.microUiCredentials,
                team: microUiConfig.microUiTeam
            }
    }

    throw new Error("Invalid project");
}


