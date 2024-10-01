import { PROJECT } from "../config/config";

export const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 6 || day === 0; // Saturday = 6, Sunday = 0
};

export const isValidProject = (value: string): value is PROJECT => {
  const validProjects: PROJECT[] = ["STAR", "SALAM", "CUSTOMER_SUCCESS"];
  return validProjects.includes(value as PROJECT);
};

// Function to calculate the date of the last n business days
export const getLastNBusinessDays = (n = 1): [Date, number] => {
  let businessDayCount = 0;
  let skipDays = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set time to 12:00 AM

  while (businessDayCount < n) {
    skipDays++;
    currentDate.setDate(currentDate.getDate() - 1); // Go one day back
    if (!isWeekend(currentDate)) {
      businessDayCount++;
    }
  }

  return [currentDate, skipDays];
};

// Main comparator function
export const isAfterLastNBusinessDays = (givenDate: string, n = 1) => {
  const [lastNBusinessDate] = getLastNBusinessDays(n);
  return new Date(givenDate) > lastNBusinessDate;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};
