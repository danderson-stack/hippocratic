"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const query_1 = __importDefault(require("./routes/query"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/query", query_1.default);
app.use("/api/appointments", appointments_1.default);
app.use((err, _req, res, _next) => {
    console.error("Unhandled application error:", err);
    res.status(500).json({ error: "Internal server error" });
});
exports.default = app;
