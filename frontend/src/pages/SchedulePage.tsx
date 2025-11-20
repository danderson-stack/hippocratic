import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  TextField,
  Typography,
  Box,
} from "@mui/material";

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 2,
        gap: 2,
      }}
    >
      <Typography variant="h4" component="h1" sx={{ textAlign: "center" }}>
        Hippocratic Appointment Schedule Agent
      </Typography>

      <Box
        ref={threadRef}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: 2,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          overflowY: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-start" : "flex-end",
            }}
          >
            <Box
              sx={{
                maxWidth: "70%",
                padding: 1.5,
                borderRadius: 1,
                backgroundColor:
                  message.sender === "user" ? "#e8f0fe" : "#e0f7e9",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {message.sender === "user" ? "User" : "Agent"}
              </Typography>
              <Typography variant="body1">{message.content}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderTop: "1px solid #e0e0e0",
          paddingTop: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label="Add a message"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={isSending || !inputValue.trim()}
          sx={{ minWidth: 120, display: "flex", gap: 1, alignItems: "center" }}
        >
          {isSending ? (
            <>
              <CircularProgress size={20} color="inherit" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </Box>
    </Box>
  );
}

export default SchedulePage;
