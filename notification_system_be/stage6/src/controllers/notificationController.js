import Log from "../../../../logging_middleware/logger.js";
import { getPriorityInbox, fetchNotifications } from "../services/notificationService.js";

export async function priorityInbox(req, res) {
  const { n } = req.body;

  Log("backend", "info", "controller",
    `POST /api/notifications/priority-inbox called with n: ${n}`
  );

  if (n === undefined || n === null) {
    Log("backend", "warn", "controller", "Missing field: n is required");
    return res.status(400).json({ success: false, error: "n is required in request body" });
  }

  if (typeof n !== "number" || !Number.isInteger(n) || n <= 0) {
    Log("backend", "warn", "controller",
      `Invalid n value: ${n} — must be a positive integer`
    );
    return res.status(400).json({ success: false, error: "n must be a positive integer" });
  }

  try {
    const topN = await getPriorityInbox(n);

    Log("backend", "info", "controller",
      `Priority inbox response sent with ${topN.length} notifications`
    );

    return res.status(200).json({
      success: true,
      requested: n,
      returned: topN.length,
      data: topN,
    });
  } catch (err) {
    Log("backend", "error", "controller",
      `Priority inbox failed: ${err.message}`
    );
    return res.status(500).json({ success: false, error: "Failed to fetch priority inbox" });
  }
}

export async function getAllNotifications(req, res) {
  Log("backend", "info", "controller", "GET /api/notifications called");

  try {
    const notifications = await fetchNotifications();

    Log("backend", "info", "controller",
      `Returning ${notifications.length} notifications`
    );

    return res.status(200).json({
      success: true,
      total: notifications.length,
      data: notifications,
    });
  } catch (err) {
    Log("backend", "error", "controller",
      `Failed to fetch notifications: ${err.message}`
    );
    return res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
}
