"use strict";
// import { JiraCredential } from "../types/types";
// import * as starConfig from "../config/star/star-config";
// import * as salamConfig from "../config/salam/salam-config";
// import * as vdaConfig from "../config/vda/vda-config";
// import * as customerSuccessConfig from "../config/customer-success/cs-config";
// import { TeamMember } from "../types/team";
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// interface Config {
//     baseurl: string;
//     board?: string;
//     credential: JiraCredential;
//     team: TeamMember[];
// }
// export type PROJECT = "STAR" | "SALAM" | "CUSTOMER_SUCCESS" | "VDA";
// export async function createConfig(project: PROJECT): Promise<void> {
//     // Use Prisma to insert the project data into the database dynamically
//     switch (project) {
//         case "STAR":
//             await prisma.project.create({
//                 data: {
//                     label: project,
//                     baseurl: starConfig.BASE_URL,  // Get the base URL from the config
//                     board: starConfig.BOARD,  // Use an empty string if board is undefined
//                     email: '',
//                     token: ''
//                 },
//             });
//         case "SALAM":
//             // Creating project record in the database
//             await prisma.project.create({
//                 data: {
//                     label: project,
//                     baseurl: salamConfig.BASE_URL,
//                     email: '',
//                     token: ''
//                     // board: ''  // Add board if available
//                 },
//             });
//         case "CUSTOMER_SUCCESS":
//             // Creating project record in the database
//             await prisma.project.create({
//                 data: {
//                     label: project,
//                     baseurl: customerSuccessConfig.BASE_URL,
//                     email: '',
//                     token: ''
//                     // board: '',
//                     // board: 'CustomerSucess' // Uncomment or define if needed
//                 },
//             });
//         case "VDA":
//                 // Creating project record in the database
//                 await prisma.project.create({
//                   data: {
//                     label: project,
//                     baseurl: vdaConfig.BASE_URL,
//                     board: vdaConfig.BOARD, // Add board if available
//                     email: '',
//                     token: ''
//                   },
//                 });
//             console.log(`Project ${project} configuration has been created in the database.`);
//     }
// }
