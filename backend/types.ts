export type Role = "user" | "assistant" | "system";

export interface ThreadMessage {
  role: Role;
  content: string;
  timestamp?: string;
}

export interface Thread {
  id: string;
  messages: ThreadMessage[];
  status?: ThreadStatus;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  [key: string]: unknown;
}

export interface AgentResponsePayload {
  assistantMessage: string;
  userUpdate?: Partial<UserProfile>;
  hasAllRequiredFields?: boolean;
  scheduleAppointment?: boolean;
}

export interface QueryRequestBody {
  user: UserProfile;
  thread?: Thread;
  message: string;
  selectedSlot?: string;
}

export type ThreadStatus =
  | "collecting_details"
  | "ready_to_schedule"
  | "awaiting_confirmation"
  | "scheduled";

export interface Appointment {
  id: string;
  userId: string;
  threadId: string;
  start: string;
  end: string;
  createdAt: string;
}
