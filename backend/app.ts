import express from "express";
import cors from "cors";
import queryRouter from "./routes/query";
import appointmentsRouter from "./routes/appointments";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/query", queryRouter);
app.use("/api/appointments", appointmentsRouter);

app.use(
  (
    err: Error,
    _req: any,
    res: any,
    _next: any
  ) => {
    console.error("Unhandled application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

export default app;
