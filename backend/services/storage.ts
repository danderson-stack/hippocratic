import { randomUUID } from "crypto";
import { Appointment, Thread, ThreadMessage, UserProfile } from "../types";

type StoredUserProfile = UserProfile & {
  createdAt: string;
  updatedAt: string;
};

type ThreadRecord = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type MessageRecord = ThreadMessage & {
  id: string;
  threadId: string;
  timestamp: string;
};

type AppointmentRecord = Appointment;

const users = new Map<string, StoredUserProfile>();
const threads = new Map<string, ThreadRecord>();
const messages = new Map<string, MessageRecord[]>();
const appointments = new Map<string, AppointmentRecord>();

const mergeUserProfile = (
  existing: UserProfile | undefined,
  updates: UserProfile
): UserProfile => {
  const merged: UserProfile = {
    ...(existing ?? { id: updates.id }),
    id: updates.id,
  };

  (Object.entries(updates) as [keyof UserProfile, unknown][]).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== "") {
        merged[key] = value as UserProfile[keyof UserProfile];
      }
    }
  );

  return merged;
};

export const upsertUserProfile = (user: UserProfile): UserProfile => {
  const now = new Date().toISOString();
  const existingProfile = getUserProfile(user.id);
  const mergedProfile = mergeUserProfile(existingProfile, user);
  const existingStoredProfile = users.get(user.id);

  const stored: StoredUserProfile = {
    ...mergedProfile,
    createdAt: existingStoredProfile?.createdAt ?? now,
    updatedAt: now,
  };

  users.set(user.id, stored);
  return mergedProfile;
};

export const getUserProfile = (userId: string): UserProfile | undefined => {
  const stored = users.get(userId);
  if (!stored) return undefined;

  // Strip metadata before returning the user profile
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...profile } = stored;
  return profile;
};

const ensureThreadRecord = (
  userId: string,
  threadId?: string
): { thread: ThreadRecord; created: boolean } => {
  let thread = threadId ? threads.get(threadId) : undefined;
  let created = false;

  if (thread) {
    if (thread.userId !== userId) {
      throw new Error("Thread does not belong to the specified user");
    }
  } else {
    const now = new Date().toISOString();
    const id = threadId ?? randomUUID();
    thread = {
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    threads.set(id, thread);
    created = true;
  }

  return { thread, created };
};

const touchThread = (threadId: string) => {
  const record = threads.get(threadId);
  if (!record) return;

  threads.set(threadId, { ...record, updatedAt: new Date().toISOString() });
};

export const recordMessage = ({
  threadId,
  role,
  content,
}: {
  threadId: string;
  role: ThreadMessage["role"];
  content: string;
}): ThreadMessage => {
  const timestamp = new Date().toISOString();
  const message: MessageRecord = {
    id: randomUUID(),
    threadId,
    role,
    content,
    timestamp,
  };

  const existingMessages = messages.get(threadId) ?? [];
  existingMessages.push(message);
  messages.set(threadId, existingMessages);
  touchThread(threadId);

  return { role, content, timestamp };
};

export const getThreadMessages = (threadId: string): ThreadMessage[] => {
  const threadMessages = messages.get(threadId) ?? [];
  return threadMessages.map(({ role, content, timestamp }) => ({
    role,
    content,
    timestamp,
  }));
};

export const getThreadRecord = (threadId: string): ThreadRecord | undefined =>
  threads.get(threadId);

export const getOrCreateThreadForUser = (params: {
  userId: string;
  threadId?: string;
}): { thread: ThreadRecord; created: boolean } =>
  ensureThreadRecord(params.userId, params.threadId);

export const getThreadWithMessages = (threadId: string): Thread => ({
  id: threadId,
  messages: getThreadMessages(threadId),
});

const toAppointment = (record: AppointmentRecord): Appointment => ({
  ...record,
});

export const createAppointment = (params: {
  userId: string;
  threadId: string;
  summary?: string;
  scheduledFor?: string;
  status?: string;
}): Appointment => {
  const now = new Date().toISOString();
  const appointment: AppointmentRecord = {
    id: randomUUID(),
    userId: params.userId,
    threadId: params.threadId,
    status: params.status ?? "scheduled",
    scheduledFor: params.scheduledFor,
    summary: params.summary,
    createdAt: now,
    updatedAt: now,
  };

  appointments.set(appointment.id, appointment);
  return toAppointment(appointment);
};

export const getAppointmentById = (
  appointmentId: string
): Appointment | undefined => {
  const record = appointments.get(appointmentId);
  return record ? toAppointment(record) : undefined;
};

export const listAppointments = (params?: {
  offset?: number;
  limit?: number;
}): { appointments: Appointment[]; total: number; offset: number; limit: number } => {
  const safeOffset = Number.isFinite(params?.offset)
    ? (params?.offset as number)
    : 0;
  const safeLimit = Number.isFinite(params?.limit)
    ? (params?.limit as number)
    : 20;

  const offset = Math.max(0, Math.floor(safeOffset));
  const limit = Math.max(1, Math.floor(safeLimit));

  const allAppointments = Array.from(appointments.values()).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );

  const paginated = allAppointments.slice(offset, offset + limit).map(toAppointment);

  return {
    appointments: paginated,
    total: allAppointments.length,
    offset,
    limit,
  };
};

export const getAppointmentDetail = (appointmentId: string) => {
  const appointment = getAppointmentById(appointmentId);
  if (!appointment) return undefined;

  const user = getUserProfile(appointment.userId);
  const messages = getThreadMessages(appointment.threadId);

  return {
    appointment,
    user,
    messages,
    thread: getThreadWithMessages(appointment.threadId),
  };
};

const seedDemoData = () => {
  if (users.size > 0 || threads.size > 0 || appointments.size > 0) return;

  const demoUser: UserProfile = {
    id: "demo-user",
    firstName: "Casey",
    lastName: "Client",
    email: "casey.client@example.com",
    phone: "555-0100",
  };

  upsertUserProfile(demoUser);
  const { thread } = ensureThreadRecord(demoUser.id);

  recordMessage({
    threadId: thread.id,
    role: "user",
    content: "I'd like to schedule an appointment for a follow-up.",
  });

  recordMessage({
    threadId: thread.id,
    role: "assistant",
    content: "Sure! I've reserved a spot for you tomorrow at 2:00 PM.",
  });

  createAppointment({
    userId: demoUser.id,
    threadId: thread.id,
    summary: "Follow-up visit",
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
};

seedDemoData();
