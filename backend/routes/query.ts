import { Router } from "express";
import {
  FALLBACK_ASSISTANT_MESSAGE,
  hasRequiredFields,
  runAgent,
} from "../services/agent";
import { scheduleAppointment } from "../services/scheduler";
import {
  getOrCreateThreadForUser,
  getThreadMessages,
  getThreadWithMessages,
  recordMessage,
  upsertUserProfile,
} from "../services/storage";
import { QueryRequestBody, UserProfile } from "../types";

const router = Router();

const mergeUserUpdate = (
  user: UserProfile,
  updates: Partial<UserProfile> | undefined
): UserProfile => ({
  ...user,
  ...(updates || {}),
});

router.post("/", async (req, res) => {
  const { user, thread, message } = req.body as QueryRequestBody;

  console.log(`[ROUTE] Received message from user ${user?.id}: "${message}"`);

  if (!user || typeof user.id !== "string" || typeof message !== "string") {
    return res.status(400).json({ error: "user and message are required" });
  }

  let activeThreadId: string;

  try {
    const { thread: activeThread, created } = getOrCreateThreadForUser({
      userId: user.id,
      threadId: thread?.id,
    });

    activeThreadId = activeThread.id;

    if (created) {
      console.log(
        `[ROUTE] Created new thread ${activeThreadId} for user ${user.id}`
      );
    }
  } catch (threadError) {
    console.error(
      `[ROUTE] Failed to resolve thread for user ${user.id}:`,
      threadError
    );
    return res.status(400).json({ error: "Invalid thread" });
  }

  const persistedUser = upsertUserProfile(user);
  const existingMessages = getThreadMessages(activeThreadId);

  recordMessage({
    threadId: activeThreadId,
    role: "user",
    content: message,
  });

  try {
    console.log(
      `[ROUTE] Calling agent for user ${user.id} with message: "${message}"`
    );
    const agentResponse = await runAgent({
      user: persistedUser,
      recentMessages: existingMessages,
      newestMessage: message,
    });
    console.log(
      `[ROUTE] Agent responded for user ${
        user.id
      }: "${agentResponse.assistantMessage.substring(0, 100)}..."`
    );

    const updatedUser = upsertUserProfile(
      mergeUserUpdate(persistedUser, agentResponse.userUpdate)
    );

    recordMessage({
      threadId: activeThreadId,
      role: "assistant",
      content: agentResponse.assistantMessage,
    });

    const hasAllFields =
      agentResponse.hasAllRequiredFields || hasRequiredFields(updatedUser);

    if (agentResponse.scheduleAppointment) {
      try {
        await scheduleAppointment(updatedUser);
      } catch (scheduleError) {
        console.error("Failed to schedule appointment:", scheduleError);
      }
    }

    console.log(
      `[ROUTE] Sending response to user ${user.id}, hasAllRequiredFields: ${hasAllFields}, scheduleAppointment: ${agentResponse.scheduleAppointment}`
    );
    return res.json({
      message: agentResponse.assistantMessage,
      user: updatedUser,
      thread: getThreadWithMessages(activeThreadId),
      hasAllRequiredFields: hasAllFields,
      scheduleAppointment: agentResponse.scheduleAppointment,
    });
  } catch (error) {
    console.error(`[ROUTE] Query handler error for user ${user?.id}:`, error);

    recordMessage({
      threadId: activeThreadId,
      role: "assistant",
      content: FALLBACK_ASSISTANT_MESSAGE,
    });

    return res.status(500).json({
      message: FALLBACK_ASSISTANT_MESSAGE,
      user: persistedUser,
      thread: getThreadWithMessages(activeThreadId),
      hasAllRequiredFields: false,
      scheduleAppointment: false,
    });
  }
});

export default router;
