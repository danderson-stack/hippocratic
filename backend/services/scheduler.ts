import { Appointment, UserProfile } from "../types";
import {
  createAppointment as persistAppointment,
  getAppointments,
} from "./storage";

const WORKING_HOURS_START = 10; // 10:00
const WORKING_HOURS_END = 17; // 17:00
const SLOT_DURATION_MINUTES = 30;

const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60_000);

const getDayStart = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const hasConflict = (slotStart: Date, appointments: Appointment[]): boolean => {
  const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);

  return appointments.some((appointment) => {
    const appointmentStart = new Date(appointment.start);
    const appointmentEnd = new Date(appointment.end);

    return slotStart < appointmentEnd && slotEnd > appointmentStart;
  });
};

const isWithinWorkingHours = (candidate: Date): boolean => {
  const hour = candidate.getHours();
  const minute = candidate.getMinutes();
  const afterStart = hour > WORKING_HOURS_START || (hour === WORKING_HOURS_START && minute >= 0);
  const beforeEnd = hour < WORKING_HOURS_END || (hour === WORKING_HOURS_END && minute === 0);
  return afterStart && beforeEnd;
};

export const getNextAvailableSlots = (
  appointments: Appointment[],
  count = 3,
  referenceDate: Date = new Date()
): string[] => {
  const slots: string[] = [];
  let cursor = new Date(referenceDate);

  // Round up to the next slot boundary
  const minutes = cursor.getMinutes();
  const offset = minutes % SLOT_DURATION_MINUTES;
  if (offset !== 0) {
    const adjustment = SLOT_DURATION_MINUTES - offset;
    cursor = addMinutes(cursor, adjustment);
  }

  let safety = 0;
  while (slots.length < count && safety < 60) {
    const dayStart = getDayStart(cursor);
    const dayWorkingStart = new Date(dayStart);
    dayWorkingStart.setHours(WORKING_HOURS_START, 0, 0, 0);

    const dayWorkingEnd = new Date(dayStart);
    dayWorkingEnd.setHours(WORKING_HOURS_END, 0, 0, 0);

    let slotCursor = new Date(Math.max(cursor.getTime(), dayWorkingStart.getTime()));

    while (slotCursor < dayWorkingEnd && slots.length < count) {
      if (isWithinWorkingHours(slotCursor) && !hasConflict(slotCursor, appointments)) {
        slots.push(slotCursor.toISOString());
      }
      slotCursor = addMinutes(slotCursor, SLOT_DURATION_MINUTES);
    }

    cursor = addMinutes(dayWorkingEnd, SLOT_DURATION_MINUTES);
    safety += 1;
  }

  return slots.slice(0, count);
};

export const createAppointment = ({
  user,
  threadId,
  slotStart,
  durationMinutes = SLOT_DURATION_MINUTES,
}: {
  user: UserProfile;
  threadId: string;
  slotStart: Date | string;
  durationMinutes?: number;
}): Appointment => {
  const startDate = typeof slotStart === "string" ? new Date(slotStart) : slotStart;
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid slot start time");
  }

  if (hasConflict(startDate, getAppointments())) {
    throw new Error("Slot is no longer available");
  }

  const endDate = addMinutes(startDate, durationMinutes);

  const record = persistAppointment({
    userId: user.id,
    threadId,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  // In a real system this would call an API. For now we log so we can trace the invocation.
  const appointmentContext = {
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.email,
    phone: user.phone,
    start: record.start,
    end: record.end,
  };

  console.info("Created appointment:", appointmentContext);
  return record;
};
