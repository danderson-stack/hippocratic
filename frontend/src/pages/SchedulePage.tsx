import React, { useEffect, useRef, useState } from "react";
import { useScheduleApi } from "../services/scheduleApi";
import type { ThreadMessage } from "../services/scheduleApi";

const PENDING_AGENT_MESSAGE = "Agent is typing...";

function SchedulePage() {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const pendingAgentIndexRef = useRef<number | null>(null);
  const { send } = useScheduleApi();

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setError(null);

    const optimisticUserMessage: ThreadMessage = {
      role: "user",
      content: trimmed,
    };

    const pendingAgentMessage: ThreadMessage = {
      role: "assistant",
      content: PENDING_AGENT_MESSAGE,
    };

    setMessages((previousMessages) => {
      const nextMessages = [
        ...previousMessages,
        optimisticUserMessage,
        pendingAgentMessage,
      ];
      pendingAgentIndexRef.current = nextMessages.length - 1;
      return nextMessages;
    });

    setInputValue("");

    try {
      const updatedThread = await send(threadId, trimmed);
      setThreadId(updatedThread.id);
      setMessages(updatedThread.messages || []);
      pendingAgentIndexRef.current = null;
    } catch (sendError) {
      const message =
        sendError instanceof Error
          ? sendError.message
          : "Failed to send message";
      setError(message);
      setMessages((previousMessages) => {
        if (
          previousMessages.length === 0 ||
          pendingAgentIndexRef.current === null
        ) {
          return previousMessages;
        }

        return previousMessages.map((threadMessage, index) =>
          index === pendingAgentIndexRef.current
            ? {
                ...threadMessage,
                content: "Unable to reach the agent. Please try again.",
              }
            : threadMessage
        );
      });
      pendingAgentIndexRef.current = null;
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ textAlign: "center", margin: 0 }}>
        Hippocratic Appointment Schedule Agent
      </h1>

      {error && (
        <div
          style={{
            color: "#b00020",
            backgroundColor: "#fdecea",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      <div
        ref={threadRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflowY: "auto",
          backgroundColor: "#fafafa",
          minHeight: "300px",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ margin: 0, color: "#666" }}>
            Send a message to start the conversation.
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.timestamp ?? ""}`}
              style={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor:
                    message.role === "user" ? "#e8f0fe" : "#e0f7e9",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  whiteSpace: "pre-wrap",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "4px",
                    fontSize: "0.9rem",
                  }}
                >
                  {message.role === "user"
                    ? "User"
                    : message.role === "assistant"
                    ? "Agent"
                    : "System"}
                </div>
                <div style={{ fontSize: "1rem", lineHeight: 1.5 }}>
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "12px",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          placeholder="Add a message"
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          onClick={() => {
            void handleSend();
          }}
          disabled={isSending || !inputValue.trim()}
          style={{
            minWidth: "120px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor:
              isSending || !inputValue.trim() ? "#9e9e9e" : "#1976d2",
            color: "white",
            cursor: isSending || !inputValue.trim() ? "not-allowed" : "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            fontSize: "1rem",
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default SchedulePage;
