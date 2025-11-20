import "dotenv/config";
import { runAgent } from "./backend/services/agent";
import { UserProfile, ThreadMessage } from "./backend/types";

async function exampleAgentUsage() {
  // Example 1: Initial conversation with a new patient
  console.log("=== Example 1: Initial patient intake ===");

  const newPatient: UserProfile = {
    id: "user123",
    // All fields are initially empty/undefined
  };

  const initialMessage: string =
    "Hi, I'd like to schedule a doctor's appointment.";

  const initialMessages: ThreadMessage[] = [];

  try {
    const response1 = await runAgent({
      user: newPatient,
      recentMessages: initialMessages,
      newestMessage: initialMessage,
    });

    console.log("Assistant:", response1.assistantMessage);
    console.log("User update:", response1.userUpdate);
    console.log("Has all required fields:", response1.hasAllRequiredFields);
    console.log("Can schedule appointment:", response1.scheduleAppointment);
    console.log();

    // Example 2: Patient provides name
    console.log("=== Example 2: Patient provides first and last name ===");

    const updatedPatient = { ...newPatient, ...response1.userUpdate };

    const followUpMessage: string = "My name is John Smith.";

    const conversationHistory: ThreadMessage[] = [
      { role: "user", content: initialMessage },
      { role: "assistant", content: response1.assistantMessage },
    ];

    const response2 = await runAgent({
      user: updatedPatient,
      recentMessages: conversationHistory,
      newestMessage: followUpMessage,
    });

    console.log("Assistant:", response2.assistantMessage);
    console.log("User update:", response2.userUpdate);
    console.log("Has all required fields:", response2.hasAllRequiredFields);
    console.log("Can schedule appointment:", response2.scheduleAppointment);
    console.log();

    // Example 3: Patient provides complete information
    console.log("=== Example 3: Patient provides all required information ===");

    const fullyUpdatedPatient = { ...updatedPatient, ...response2.userUpdate };

    const finalMessage: string =
      "My email is john.smith@email.com and my phone number is 555-0123.";

    const fullConversationHistory: ThreadMessage[] = [
      ...conversationHistory,
      { role: "user", content: followUpMessage },
      { role: "assistant", content: response2.assistantMessage },
    ];

    const response3 = await runAgent({
      user: fullyUpdatedPatient,
      recentMessages: fullConversationHistory,
      newestMessage: finalMessage,
    });

    console.log("Assistant:", response3.assistantMessage);
    console.log("User update:", response3.userUpdate);
    console.log("Has all required fields:", response3.hasAllRequiredFields);
    console.log("Can schedule appointment:", response3.scheduleAppointment);
  } catch (error) {
    console.error("Error running agent:", error);
  }
}

// Run the example
exampleAgentUsage();
