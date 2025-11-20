import { Router } from "express";
import {
  findAppointmentById,
  getAppointments,
  getThreadMessagesWithIds,
  getThreadSummary,
  getUserProfile,
} from "../services/storage";
import { ThreadStatus } from "../types";

const router = Router();

const formatStatus = (status?: ThreadStatus): ThreadStatus | "scheduled" =>
  status ?? "scheduled";

const formatAppointment = (
  appointment: ReturnType<typeof findAppointmentById>,
  threadStatus?: ThreadStatus,
  threadUpdatedAt?: string
) => {
  if (!appointment) return undefined;

  return {
    id: appointment.id,
    user_id: appointment.userId,
    thread_id: appointment.threadId,
    start: appointment.start,
    end: appointment.end,
    scheduled_for: appointment.start,
    created_at: appointment.createdAt,
    updated_at: threadUpdatedAt ?? appointment.createdAt,
    status: formatStatus(threadStatus),
  };
};

const formatUser = (user: ReturnType<typeof getUserProfile>) => {
  if (!user) return undefined;

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: user.id,
    name: fullName || undefined,
    email: user.email,
    phone: user.phone,
  };
};

const formatMessageSender = (role: string | undefined) => {
  switch (role) {
    case "assistant":
      return "Assistant";
    case "user":
      return "User";
    case "system":
      return "System";
    default:
      return undefined;
  }
};

router.get("/", (_req, res) => {
  const appointments = getAppointments().map((appointment) => {
    const thread = getThreadSummary(appointment.threadId);
    const user = getUserProfile(appointment.userId);
    const formattedUser = formatUser(user);

    const formattedAppointment = formatAppointment(
      appointment,
      thread?.status,
      thread?.updatedAt
    );

    return {
      ...formattedAppointment,
      user: formattedUser,
      patient_name: formattedUser?.name,
      patient_email: formattedUser?.email,
      patient_phone: formattedUser?.phone,
    };
  });

  return res.json({ appointments });
});

router.get("/:id", (req, res) => {
  const appointment = findAppointmentById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const thread = getThreadSummary(appointment.threadId);
  const user = getUserProfile(appointment.userId);
  const messages = getThreadMessagesWithIds(appointment.threadId).map(
    (message) => ({
      id: message.id,
      content: message.content,
      role: message.role,
      created_at: message.timestamp,
      sender: formatMessageSender(message.role),
    })
  );

  return res.json({
    appointment: formatAppointment(appointment, thread?.status, thread?.updatedAt),
    user: formatUser(user),
    messages,
  });
});

export default router;
