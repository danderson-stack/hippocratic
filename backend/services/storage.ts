import { randomUUID } from "crypto";
import { Thread, ThreadMessage, UserProfile } from "../types";

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

const users = new Map<string, StoredUserProfile>();
const threads = new Map<string, ThreadRecord>();
const messages = new Map<string, MessageRecord[]>();

const mergeUserProfile = (
  existing: UserProfile | undefined,
  updates: UserProfile
): UserProfile => {
  const merged: UserProfile = { ...(existing ?? { id: updates.id }), id: updates.id };

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

export const getOrCreateThreadForUser = (params: {
  userId: string;
  threadId?: string;
}): { thread: ThreadRecord; created: boolean } => ensureThreadRecord(params.userId, params.threadId);

export const getThreadWithMessages = (threadId: string): Thread => ({
  id: threadId,
  messages: getThreadMessages(threadId),
});
