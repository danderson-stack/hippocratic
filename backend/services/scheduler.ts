import { UserProfile } from "../types";
import { createAppointment } from "./storage";

export const scheduleAppointment = async (params: {
  user: UserProfile;
  threadId: string;
  summary?: string;
  scheduledFor?: string;
}) => {
  const { user, threadId, summary, scheduledFor } = params;

  const appointmentContext = {
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.email,
    phone: user.phone,
    summary,
    scheduledFor,
    threadId,
  };

  // In a real system this would call an API. For now we log so we can trace the invocation.
  console.info("Scheduling appointment with context:", appointmentContext);

  return createAppointment({
    userId: user.id,
    threadId,
    summary,
    scheduledFor,
  });
};
