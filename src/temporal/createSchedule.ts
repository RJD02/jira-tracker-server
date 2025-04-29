import { Connection, ScheduleClient } from "@temporalio/client";

async function createSchedule() {
  const connection = await Connection.connect();
  const scheduleClient = new ScheduleClient({ connection });

  await scheduleClient.create({
    scheduleId: "fetch-labels-schedule",
    spec: {
      intervals: [{ every: "30m" }], // Run every 30 minutes
    },
    action: {
      type: "startWorkflow",
      workflowType: "fetchLabelsWorkflow",
      taskQueue: "jira-task-queue",
      args: [], // Pass any arguments to the workflow if needed
    },
  });

  console.log("Schedule created to run fetchLabelsWorkflow every 30 minutes.");
}

createSchedule().catch((err) => {
  console.error("Failed to create schedule:", err);
});
