import express from "express";
import queryRouter from "./routes/query";

const app = express();

app.use(express.json());
app.use("/api/query", queryRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

export default app;
