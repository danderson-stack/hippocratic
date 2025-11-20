export type Role = "user" | "assistant" | "system";

export interface ThreadMessage {
  role: Role;
  content: string;
  timestamp?: string;
}

export interface Thread {
  id: string;
  messages: ThreadMessage[];
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  symptoms?: string;
  preferredDate?: string;
  preferredTime?: string;
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
}
