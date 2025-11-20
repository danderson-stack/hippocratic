import { Router } from "express";
import {
  FALLBACK_ASSISTANT_MESSAGE,
  hasRequiredFields,
  runAgent,
} from "../services/agent";
import { scheduleAppointment } from "../services/scheduler";
import { QueryRequestBody, ThreadMessage, UserProfile } from "../types";

const router = Router();

const appendMessage = (
  messages: ThreadMessage[],
  role: ThreadMessage["role"],
  content: string
) => [
  ...messages,
  {
    role,
    content,
    timestamp: new Date().toISOString(),
  },
];

const mergeUserUpdate = (
  user: UserProfile,
  updates: Partial<UserProfile> | undefined
): UserProfile => ({
  ...user,
  ...(updates || {}),
});

router.post("/", async (req, res) => {
  const { user, thread, message } = req.body as QueryRequestBody;

  if (!user || !thread || typeof message !== "string") {
    return res
      .status(400)
      .json({ error: "user, thread, and message are required" });
  }

  const conversation = thread.messages || [];
  const userThreadMessages = appendMessage(conversation, "user", message);

  try {
    const agentResponse = await runAgent({
      user,
      recentMessages: conversation,
      newestMessage: message,
    });

    const updatedUser = mergeUserUpdate(user, agentResponse.userUpdate);
    const updatedThread = {
      ...thread,
      messages: appendMessage(
        userThreadMessages,
        "assistant",
        agentResponse.assistantMessage
      ),
    };

    const hasAllFields =
      agentResponse.hasAllRequiredFields || hasRequiredFields(updatedUser);

    if (agentResponse.scheduleAppointment) {
      try {
        await scheduleAppointment(updatedUser);
      } catch (scheduleError) {
        console.error("Failed to schedule appointment:", scheduleError);
      }
    }

    return res.json({
      message: agentResponse.assistantMessage,
      user: updatedUser,
      thread: updatedThread,
      hasAllRequiredFields: hasAllFields,
      scheduleAppointment: agentResponse.scheduleAppointment,
    });
  } catch (error) {
    console.error("Query handler error:", error);
    return res.status(500).json({
      message: FALLBACK_ASSISTANT_MESSAGE,
      user,
      thread: {
        ...thread,
        messages: userThreadMessages,
      },
      hasAllRequiredFields: false,
      scheduleAppointment: false,
    });
  }
});

export default router;
