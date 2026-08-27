import "dotenv/config";
import express from "express";
import cors from "cors";
import { anchorsRouter } from "./routes/anchors";
import { publicRouter } from "./routes/public";
import { authRouter } from "./routes/auth";
import { operatorRouter } from "./routes/operator";
import { x402Router } from "./routes/x402";
import { adminRouter } from "./routes/admin";
import { providersRouter } from "./routes/providers";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", anchorsRouter);
app.use("/api/v1", publicRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", operatorRouter);
app.use("/api/v1", x402Router);
app.use("/api/v1", adminRouter);
app.use("/api/v1", providersRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`api listening on :${port}`);
});

export { app };
