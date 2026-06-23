import express from "express";
import config from "./src/config/env.js";
import Log from "../../logging_middleware/logger.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  Log("backend", "info", "middleware",
    `Incoming request: ${req.method} ${req.path}`
  );
  next();
});

app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  Log("backend", "info", "route", "Health check hit");
  res.json({ status: "Campus Notification Service is running" });
});

app.use((req, res) => {
  Log("backend", "warn", "middleware",
    `404 - Route not found: ${req.method} ${req.path}`
  );
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  Log("backend", "fatal", "middleware", `Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: "Something went wrong" });
});

app.listen(config.PORT, () => {
  Log("backend", "info", "config", `Notification service started on port ${config.PORT}`);
  console.log(`Server running on http://localhost:${config.PORT}`);
});
