import OpenAI from "openai";
import { AgentResponsePayload, ThreadMessage, UserProfile } from "../types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const REQUIRED_USER_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "summary",
];

const getSystemInstructions = () =>
  `You are a compassionate medical intake assistant. Use the conversation and known user fields to gather missing details politely. When a user provides their name, split it into firstName and lastName fields. Be sure to capture a brief summary/reason for the appointment. Always respond with a single JSON object containing: \n- "assistantMessage": string for the patient,\n- "userUpdate": object with any new or updated user fields,\n- "hasAllRequiredFields": boolean true only when ${REQUIRED_USER_FIELDS.join(
    ", "
  )} are known,\n- "scheduleAppointment": boolean true when all required fields are collected and the user is ready to schedule.\nDo not include any extra keys.`;

export const FALLBACK_ASSISTANT_MESSAGE =
  "I'm sorry, but I couldn't process that right now. Could you please rephrase or provide the details again?";

interface RunAgentParams {
  user: UserProfile;
  recentMessages: ThreadMessage[];
  newestMessage: string;
  model?: string;
}

const formatKnownUserFields = (user: UserProfile): string => {
  const entries = Object.entries(user)
    .filter(
      ([key, value]) => key !== "id" && value !== undefined && value !== ""
    )
    .map(([key, value]) => `- ${key}: ${String(value)}`);

  return entries.length ? entries.join("\n") : "No fields captured yet.";
};

const buildMessages = ({
  user,
  recentMessages,
  newestMessage,
}: RunAgentParams) => {
  const history = recentMessages.slice(-8).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const knownFields = formatKnownUserFields(user);

  return [
    {
      role: "system" as const,
      content: `${getSystemInstructions()}\n\nKnown user fields:\n${knownFields}`,
    },
    ...history,
    {
      role: "user" as const,
      content: newestMessage,
    },
  ];
};

const parseResponse = (rawContent: string | null): AgentResponsePayload => {
  if (!rawContent) {
    throw new Error("Missing assistant message content");
  }

  const parsed = JSON.parse(rawContent);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Assistant response was not a JSON object");
  }

  return {
    assistantMessage: parsed.assistantMessage ?? FALLBACK_ASSISTANT_MESSAGE,
    userUpdate: parsed.userUpdate ?? {},
    hasAllRequiredFields: Boolean(parsed.hasAllRequiredFields),
    scheduleAppointment: Boolean(parsed.scheduleAppointment),
  };
};

export const runAgent = async (
  params: RunAgentParams
): Promise<AgentResponsePayload & { rawContent?: string }> => {
  console.log(`[AGENT] Starting agent call for user ${params.user.id}`);
  console.log(`[AGENT] User message: "${params.newestMessage}"`);
  console.log(`[AGENT] Recent messages count: ${params.recentMessages.length}`);

  try {
    const messages = buildMessages(params);
    const model = params.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

    console.log(
      `[AGENT] Calling OpenAI API with model: ${model}, message count: ${messages.length}`
    );

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages,
    });

    console.log(
      `[AGENT] Received response from OpenAI, usage: ${JSON.stringify(
        completion.usage
      )}`
    );

    const content = completion.choices[0]?.message?.content ?? null;
    const parsed = parseResponse(content);

    console.log(
      `[AGENT] Parsed response - assistantMessage length: ${parsed.assistantMessage.length}, hasAllRequiredFields: ${parsed.hasAllRequiredFields}, scheduleAppointment: ${parsed.scheduleAppointment}`
    );

    console.log(
      `[AGENT] Agent call completed successfully for user ${params.user.id}`
    );
    return {
      ...parsed,
      rawContent: content ?? undefined,
    };
  } catch (error) {
    console.error(
      `[AGENT] Agent call failed for user ${params.user.id}:`,
      error
    );
    return {
      assistantMessage: FALLBACK_ASSISTANT_MESSAGE,
      userUpdate: {},
      hasAllRequiredFields: false,
      scheduleAppointment: false,
    };
  }
};

export const hasRequiredFields = (user: UserProfile): boolean =>
  REQUIRED_USER_FIELDS.every((field) => Boolean(user[field]));
