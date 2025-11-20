"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("../services/storage");
const router = (0, express_1.Router)();
const formatStatus = (status) => status ?? "scheduled";
const formatAppointment = (appointment, threadStatus, threadUpdatedAt) => {
    if (!appointment)
        return undefined;
    return {
        id: appointment.id,
        user_id: appointment.userId,
        thread_id: appointment.threadId,
        start: appointment.start,
        end: appointment.end,
        scheduled_for: appointment.start,
        created_at: appointment.createdAt,
        updated_at: threadUpdatedAt ?? appointment.createdAt,
        status: formatStatus(threadStatus),
    };
};
const formatUser = (user) => {
    if (!user)
        return undefined;
    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    return {
        id: user.id,
        name: fullName || undefined,
        email: user.email,
        phone: user.phone,
        summary: user.summary,
    };
};
const formatMessageSender = (role) => {
    switch (role) {
        case "assistant":
            return "Assistant";
        case "user":
            return "User";
        case "system":
            return "System";
        default:
            return undefined;
    }
};
router.get("/", (_req, res) => {
    const appointments = (0, storage_1.getAppointments)().map((appointment) => {
        const thread = (0, storage_1.getThreadSummary)(appointment.threadId);
        const user = (0, storage_1.getUserProfile)(appointment.userId);
        const formattedUser = formatUser(user);
        const formattedAppointment = formatAppointment(appointment, thread?.status, thread?.updatedAt);
        const reason = user?.summary;
        return {
            ...formattedAppointment,
            user: formattedUser,
            patient_name: formattedUser?.name,
            patient_email: formattedUser?.email,
            patient_phone: formattedUser?.phone,
            reason,
            summary: reason,
        };
    });
    return res.json({ appointments });
});
router.get("/:id", (req, res) => {
    const appointment = (0, storage_1.findAppointmentById)(req.params.id);
    if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
    }
    const thread = (0, storage_1.getThreadSummary)(appointment.threadId);
    const user = (0, storage_1.getUserProfile)(appointment.userId);
    const messages = (0, storage_1.getThreadMessagesWithIds)(appointment.threadId).map((message) => ({
        id: message.id,
        content: message.content,
        role: message.role,
        created_at: message.timestamp,
        sender: formatMessageSender(message.role),
    }));
    const reason = user?.summary;
    const formattedAppointment = formatAppointment(appointment, thread?.status, thread?.updatedAt);
    return res.json({
        appointment: {
            ...formattedAppointment,
            reason,
            summary: reason,
        },
        user: formatUser(user),
        messages,
    });
});
exports.default = router;
