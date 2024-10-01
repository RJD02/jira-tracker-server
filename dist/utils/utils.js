"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.isAfterLastNBusinessDays = exports.getLastNBusinessDays = exports.isValidProject = exports.isWeekend = void 0;
const isWeekend = (date) => {
    const day = date.getDay();
    return day === 6 || day === 0; // Saturday = 6, Sunday = 0
};
exports.isWeekend = isWeekend;
const isValidProject = (value) => {
    const validProjects = ["STAR", "SALAM", "CUSTOMER_SUCCESS"];
    return validProjects.includes(value);
};
exports.isValidProject = isValidProject;
// Function to calculate the date of the last n business days
const getLastNBusinessDays = (n = 1) => {
    let businessDayCount = 0;
    let skipDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to 12:00 AM
    while (businessDayCount < n) {
        skipDays++;
        currentDate.setDate(currentDate.getDate() - 1); // Go one day back
        if (!(0, exports.isWeekend)(currentDate)) {
            businessDayCount++;
        }
    }
    return [currentDate, skipDays];
};
exports.getLastNBusinessDays = getLastNBusinessDays;
// Main comparator function
const isAfterLastNBusinessDays = (givenDate, n = 1) => {
    const [lastNBusinessDate] = (0, exports.getLastNBusinessDays)(n);
    return new Date(givenDate) > lastNBusinessDate;
};
exports.isAfterLastNBusinessDays = isAfterLastNBusinessDays;
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};
exports.formatDate = formatDate;
