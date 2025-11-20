"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNextAvailableSlot = findNextAvailableSlot;
exports.scheduleNextAvailable = scheduleNextAvailable;
exports.listAppointments = listAppointments;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;
const SLOT_MINUTES = 30;
const appointments = [];
function getWorkingWindow(baseDate) {
    const start = new Date(baseDate);
    start.setHours(WORK_START_HOUR, 0, 0, 0);
    const end = new Date(baseDate);
    end.setHours(WORK_END_HOUR, 0, 0, 0);
    return { start, end };
}
function roundUpToSlot(date) {
    const slotLengthMs = SLOT_MINUTES * 60 * 1000;
    return new Date(Math.ceil(date.getTime() / slotLengthMs) * slotLengthMs);
}
function hasConflict(start, end) {
    return appointments.some((appointment) => start < appointment.end && end > appointment.start);
}
function findNextAvailableSlot(from = new Date()) {
    const slotLengthMs = SLOT_MINUTES * 60 * 1000;
    let current = new Date(from);
    let { start: dayStart, end: dayEnd } = getWorkingWindow(current);
    if (current > dayEnd) {
        const nextDay = new Date(dayStart);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(WORK_START_HOUR, 0, 0, 0);
        current = nextDay;
    }
    else if (current < dayStart) {
        current = dayStart;
    }
    else {
        current = roundUpToSlot(current);
    }
    while (true) {
        ({ start: dayStart, end: dayEnd } = getWorkingWindow(current));
        if (current < dayStart) {
            current = dayStart;
        }
        if (current >= dayEnd) {
            current.setDate(current.getDate() + 1);
            current.setHours(WORK_START_HOUR, 0, 0, 0);
            continue;
        }
        const candidateEnd = new Date(current.getTime() + slotLengthMs);
        if (candidateEnd > dayEnd) {
            current.setDate(current.getDate() + 1);
            current.setHours(WORK_START_HOUR, 0, 0, 0);
            continue;
        }
        if (!hasConflict(current, candidateEnd)) {
            return { start: new Date(current), end: candidateEnd };
        }
        current = candidateEnd;
    }
}
function scheduleNextAvailable({ threadId, userId, summary, }) {
    const slot = findNextAvailableSlot();
    const appointment = {
        threadId,
        userId,
        summary,
        start: slot.start,
        end: slot.end,
    };
    appointments.push(appointment);
    return appointment;
}
function listAppointments() {
    return [...appointments];
}
