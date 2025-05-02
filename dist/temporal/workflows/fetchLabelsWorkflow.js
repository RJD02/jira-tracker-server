"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLabelsWorkflow = fetchLabelsWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { fetchLabels, processLabel } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: "1 minute",
    retry: {
        maximumAttempts: 3,
    },
});
async function fetchLabelsWorkflow() {
    // Fetch all labels from the project2 table
    const labels = await fetchLabels();
    // Process each label
    for (const label of labels) {
        await processLabel(label);
    }
}
