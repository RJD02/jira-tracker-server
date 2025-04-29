import { PrismaClient } from "@prisma/client";
import { fetchProjectJiraData } from "../../controller/jira-client";

const prisma = new PrismaClient();

export async function fetchLabels(): Promise<string[]> {
  const projects = await prisma.project2.findMany({
    select: { label: true },
  });
  return projects.map((project) => project.label);
}

export async function processLabel(label: string): Promise<void> {
  console.log(`Processing label: ${label}`);
  try {
    // Fetch data for the label
    const lastUpdateTime = new Date(); // Replace with actual logic to get last update time
    await fetchProjectJiraData(label, lastUpdateTime);
  } catch (error) {
    console.error(`Error processing label ${label}: ${error}`);
  }
  console.log(`Finished processing label: ${label}`);
}
