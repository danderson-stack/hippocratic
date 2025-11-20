"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_1 = require("../services/agent");
const scheduler_1 = require("../services/scheduler");
const storage_1 = require("../services/storage");
const router = (0, express_1.Router)();
const mergeUserUpdate = (user, updates) => ({
    ...user,
    ...(updates || {}),
});
router.post("/", async (req, res) => {
    const { user, thread, message, selectedSlot } = req.body;
    console.log(`[ROUTE] Received message from user ${user?.id}: "${message}"`);
    if (!user || typeof user.id !== "string" || typeof message !== "string") {
        return res.status(400).json({ error: "user and message are required" });
    }
    let activeThreadId;
    try {
        const { thread: activeThread, created } = (0, storage_1.getOrCreateThreadForUser)({
            userId: user.id,
            threadId: thread?.id,
        });
        activeThreadId = activeThread.id;
        if (created) {
            console.log(`[ROUTE] Created new thread ${activeThreadId} for user ${user.id}`);
        }
    }
    catch (threadError) {
        console.error(`[ROUTE] Failed to resolve thread for user ${user.id}:`, threadError);
        return res.status(400).json({ error: "Invalid thread" });
    }
    const persistedUser = (0, storage_1.upsertUserProfile)(user);
    const existingMessages = (0, storage_1.getThreadMessages)(activeThreadId);
    (0, storage_1.recordMessage)({
        threadId: activeThreadId,
        role: "user",
        content: message,
    });
    let confirmedAppointment;
    if (selectedSlot) {
        try {
            confirmedAppointment = (0, scheduler_1.createAppointment)({
                user: persistedUser,
                threadId: activeThreadId,
                slotStart: selectedSlot,
            });
            (0, storage_1.updateThreadStatus)(activeThreadId, "scheduled");
        }
        catch (error) {
            console.error("Failed to create appointment:", error);
            return res.status(400).json({ error: "Unable to create appointment" });
        }
    }
    try {
        console.log(`[ROUTE] Calling agent for user ${user.id} with message: "${message}"`);
        const agentResponse = await (0, agent_1.runAgent)({
            user: persistedUser,
            recentMessages: existingMessages,
            newestMessage: message,
        });
        console.log(`[ROUTE] Agent responded for user ${user.id}: "${agentResponse.assistantMessage.substring(0, 100)}..."`);
        const updatedUser = (0, storage_1.upsertUserProfile)(mergeUserUpdate(persistedUser, agentResponse.userUpdate));
        (0, storage_1.recordMessage)({
            threadId: activeThreadId,
            role: "assistant",
            content: agentResponse.assistantMessage,
        });
        const hasAllFields = agentResponse.hasAllRequiredFields || (0, agent_1.hasRequiredFields)(updatedUser);
        const readyToSchedule = agentResponse.scheduleAppointment || hasAllFields || Boolean(confirmedAppointment);
        let availableSlots = [];
        let threadStatus = (0, storage_1.getThreadStatus)(activeThreadId);
        if (confirmedAppointment) {
            threadStatus = "scheduled";
        }
        else if (readyToSchedule) {
            availableSlots = (0, scheduler_1.getNextAvailableSlots)((0, storage_1.getAppointments)(), 3, new Date());
            threadStatus = availableSlots.length
                ? "awaiting_confirmation"
                : "ready_to_schedule";
        }
        else {
            threadStatus = "collecting_details";
        }
        (0, storage_1.updateThreadStatus)(activeThreadId, threadStatus);
        console.log(`[ROUTE] Sending response to user ${user.id}, hasAllRequiredFields: ${hasAllFields}, scheduleAppointment: ${agentResponse.scheduleAppointment}`);
        return res.json({
            message: agentResponse.assistantMessage,
            user: updatedUser,
            thread: (0, storage_1.getThreadWithMessages)(activeThreadId),
            hasAllRequiredFields: hasAllFields,
            scheduleAppointment: agentResponse.scheduleAppointment,
            availableSlots,
            appointment: confirmedAppointment,
        });
    }
    catch (error) {
        console.error(`[ROUTE] Query handler error for user ${user?.id}:`, error);
        (0, storage_1.recordMessage)({
            threadId: activeThreadId,
            role: "assistant",
            content: agent_1.FALLBACK_ASSISTANT_MESSAGE,
        });
        return res.status(500).json({
            message: agent_1.FALLBACK_ASSISTANT_MESSAGE,
            user: persistedUser,
            thread: (0, storage_1.getThreadWithMessages)(activeThreadId),
            hasAllRequiredFields: false,
            scheduleAppointment: false,
        });
    }
});
exports.default = router;
