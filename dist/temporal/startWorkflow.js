"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetchLabelsWorkflow_1 = require("./workflows/fetchLabelsWorkflow");
const client_1 = require("@temporalio/client");
async function startWorkflow() {
    const connection = await client_1.Connection.connect();
    const client = new client_1.Client({ connection });
    const handle = await client.workflow.start(fetchLabelsWorkflow_1.fetchLabelsWorkflow, {
        taskQueue: "jira-task-queue",
        workflowId: "fetch-labels-workflow",
    });
    console.log(`Started workflow with ID: ${handle.workflowId}`);
}
startWorkflow().catch((err) => {
    console.error("Failed to start workflow:", err);
});
