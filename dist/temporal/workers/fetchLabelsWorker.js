"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("@temporalio/worker");
const path_1 = __importDefault(require("path"));
async function runWorker() {
    const worker = await worker_1.Worker.create({
        workflowsPath: path_1.default.join(__dirname, "../workflows"),
        activities: require("../activities/fetchLabelActivities"),
        taskQueue: "jira-task-queue",
    });
    console.log("Worker started for task queue: fetch-labels-task-queue");
    await worker.run();
}
runWorker().catch((err) => {
    console.error("Worker failed:", err);
    process.exit(1);
});
