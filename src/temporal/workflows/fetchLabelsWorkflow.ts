import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities/fetchLabelActivities";

const { fetchLabels, processLabel } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 3,
  },
});

export async function fetchLabelsWorkflow(): Promise<void> {
  // Fetch all labels from the project2 table
  const labels = await fetchLabels();

  // Process each label
  for (const label of labels) {
    await processLabel(label);
  }
}
