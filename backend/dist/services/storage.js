"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = exports.getAppointments = exports.getThreadStatus = exports.getThreadWithMessages = exports.getOrCreateThreadForUser = exports.getThreadMessages = exports.recordMessage = exports.updateThreadStatus = exports.getUserProfile = exports.upsertUserProfile = void 0;
const crypto_1 = require("crypto");
const users = new Map();
const threads = new Map();
const messages = new Map();
const appointments = [];
const mergeUserProfile = (existing, updates) => {
    const merged = {
        ...(existing ?? { id: updates.id }),
        id: updates.id,
    };
    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            merged[key] = value;
        }
    });
    return merged;
};
const upsertUserProfile = (user) => {
    const now = new Date().toISOString();
    const existingProfile = (0, exports.getUserProfile)(user.id);
    const mergedProfile = mergeUserProfile(existingProfile, user);
    const existingStoredProfile = users.get(user.id);
    const stored = {
        ...mergedProfile,
        createdAt: existingStoredProfile?.createdAt ?? now,
        updatedAt: now,
    };
    users.set(user.id, stored);
    return mergedProfile;
};
exports.upsertUserProfile = upsertUserProfile;
const getUserProfile = (userId) => {
    const stored = users.get(userId);
    if (!stored)
        return undefined;
    // Strip metadata before returning the user profile
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...profile } = stored;
    return profile;
};
exports.getUserProfile = getUserProfile;
const ensureThreadRecord = (userId, threadId) => {
    let thread = threadId ? threads.get(threadId) : undefined;
    let created = false;
    if (thread) {
        if (thread.userId !== userId) {
            throw new Error("Thread does not belong to the specified user");
        }
    }
    else {
        const now = new Date().toISOString();
        const id = threadId ?? (0, crypto_1.randomUUID)();
        thread = {
            id,
            userId,
            createdAt: now,
            updatedAt: now,
            status: "collecting_details",
        };
        threads.set(id, thread);
        created = true;
    }
    return { thread, created };
};
const touchThread = (threadId) => {
    const record = threads.get(threadId);
    if (!record)
        return;
    threads.set(threadId, { ...record, updatedAt: new Date().toISOString() });
};
const updateThreadStatus = (threadId, status) => {
    const record = threads.get(threadId);
    if (!record) {
        throw new Error("Thread not found");
    }
    const updatedRecord = { ...record, status, updatedAt: new Date().toISOString() };
    threads.set(threadId, updatedRecord);
    return status;
};
exports.updateThreadStatus = updateThreadStatus;
const recordMessage = ({ threadId, role, content, }) => {
    const timestamp = new Date().toISOString();
    const message = {
        id: (0, crypto_1.randomUUID)(),
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
exports.recordMessage = recordMessage;
const getThreadMessages = (threadId) => {
    const threadMessages = messages.get(threadId) ?? [];
    return threadMessages.map(({ role, content, timestamp }) => ({
        role,
        content,
        timestamp,
    }));
};
exports.getThreadMessages = getThreadMessages;
const getOrCreateThreadForUser = (params) => ensureThreadRecord(params.userId, params.threadId);
exports.getOrCreateThreadForUser = getOrCreateThreadForUser;
const getThreadWithMessages = (threadId) => {
    const record = threads.get(threadId);
    if (!record) {
        throw new Error("Thread not found");
    }
    return {
        id: threadId,
        messages: (0, exports.getThreadMessages)(threadId),
        status: record.status,
    };
};
exports.getThreadWithMessages = getThreadWithMessages;
const getThreadStatus = (threadId) => {
    const record = threads.get(threadId);
    if (!record) {
        throw new Error("Thread not found");
    }
    return record.status;
};
exports.getThreadStatus = getThreadStatus;
const getAppointments = () => [...appointments];
exports.getAppointments = getAppointments;
const createAppointment = (appointment) => {
    const now = new Date().toISOString();
    const record = {
        ...appointment,
        id: (0, crypto_1.randomUUID)(),
        createdAt: now,
    };
    appointments.push(record);
    touchThread(appointment.threadId);
    return record;
};
exports.createAppointment = createAppointment;
