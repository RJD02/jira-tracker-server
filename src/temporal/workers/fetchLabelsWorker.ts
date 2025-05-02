import { Worker } from "@temporalio/worker";
import path from "path";

async function runWorker() {
  const worker = await Worker.create({
    workflowsPath: path.join(__dirname, "../workflows"),
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
