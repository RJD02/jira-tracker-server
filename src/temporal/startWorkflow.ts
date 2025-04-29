import { fetchLabelsWorkflow } from "./workflows/fetchLabelsWorkflow";
import { Connection, Client } from "@temporalio/client";
async function startWorkflow() {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  const handle = await client.workflow.start(fetchLabelsWorkflow, {
    taskQueue: "jira-task-queue",
    workflowId: "fetch-labels-workflow",
  });

  console.log(`Started workflow with ID: ${handle.workflowId}`);
}

startWorkflow().catch((err) => {
  console.error("Failed to start workflow:", err);
});
