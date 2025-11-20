import { useCallback } from "react";
import { API_BASE_URL } from "../constants/api";

export type Role = "user" | "assistant" | "system";

export interface ThreadMessage {
  role: Role;
  content: string;
  timestamp?: string;
}

export interface Thread {
  id: string;
  messages: ThreadMessage[];
  status?: string;
}

export interface QueryResponse {
  thread: Thread;
  availableSlots?: string[];
}

const isThread = (value: unknown): value is Thread => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as Thread).id === "string" &&
    Array.isArray((value as Thread).messages)
  );
};

const USER_ID_STORAGE_KEY = "schedule-user-id";

const getOrCreateUserId = (): string => {
  const existing = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(USER_ID_STORAGE_KEY, newId);
  return newId;
};

export const resetUserId = () => {
  localStorage.removeItem(USER_ID_STORAGE_KEY);
};

const buildHeaders = () => ({
  "Content-Type": "application/json",
});

export async function sendMessage(
  threadId: string | undefined,
  content: string,
  selectedSlot?: string
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      user: { id: getOrCreateUserId() },
      thread: threadId ? { id: threadId } : undefined,
      message: content,
      selectedSlot,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  const data = (await response.json()) as QueryResponse;

  if (!data.thread?.id) {
    throw new Error("Missing thread information in response");
  }

  return data;
}

export async function getThread(threadId: string): Promise<Thread> {
  const response = await fetch(`${API_BASE_URL}/api/threads/${threadId}`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch thread");
  }

  const data = (await response.json()) as { thread?: Thread } | Thread;
  const thread = isThread(data)
    ? data
    : isThread((data as { thread?: Thread }).thread)
    ? (data as { thread: Thread }).thread
    : undefined;

  if (!thread) {
    throw new Error("Thread not found");
  }

  return thread;
}

export const useScheduleApi = () => {
  const send = useCallback(
    async (
      threadId: string | undefined,
      content: string,
      selectedSlot?: string
    ) => {
      return sendMessage(threadId, content, selectedSlot);
    },
    []
  );

  return { send };
};
