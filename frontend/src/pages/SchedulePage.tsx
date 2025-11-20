import React, { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: number;
  sender: "user" | "agent";
  content: string;
}

async function sendMessageToBackend(message: string): Promise<string> {
  // Placeholder for backend integration.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `Agent received: ${message}`;
}

function SchedulePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "user",
      content: "Hello! I'd like to book an appointment.",
    },
    {
      id: 2,
      sender: "agent",
      content: "Sure, I can help schedule that for you.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setIsSending(true);
    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    try {
      const agentReply = await sendMessageToBackend(trimmed);
      const newAgentMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "agent",
        content: agentReply,
      };
      setMessages((prev) => [...prev, newAgentMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        gap: "1rem",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", margin: 0 }}>
        Hippocratic Appointment Schedule Agent
      </h1>

      <div
        ref={threadRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: "1rem",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflowY: "auto",
          backgroundColor: "#fafafa",
          minHeight: "320px",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "0.9rem",
                borderRadius: "10px",
                backgroundColor:
                  message.sender === "user" ? "#e8f0fe" : "#e0f7e9",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
                {message.sender === "user" ? "User" : "Agent"}
              </div>
              <p style={{ margin: 0 }}>{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleSend();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "0.75rem",
        }}
      >
        <input
          aria-label="Add a message"
          value={inputValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={isSending}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            fontSize: "1rem",
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !inputValue.trim()}
          style={{
            minWidth: "120px",
            display: "inline-flex",
            gap: "0.5rem",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem 1rem",
            backgroundColor: isSending || !inputValue.trim() ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isSending || !inputValue.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isSending ? (
            "Sending..."
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}

export default SchedulePage;
