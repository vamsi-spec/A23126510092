import Log from "../../../../logging_middleware/logger.js";
import config from "../config/env.js";
import { getTopNByPriority } from "../utils/priorityInbox.js";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${config.AUTH_TOKEN}`,
};

const MOCK_NOTIFICATIONS = [
  {
    id: "d3b07384-d113-4a11-a590-798413b5a687",
    type: "Placement",
    message: "Google is hiring Software Engineers",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "e5792131-419b-4e96-859e-45fa21e64903",
    type: "Result",
    message: "Semester exams syllabus released",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "f8241b12-9e45-4dfc-a112-93e1a06f8510",
    type: "Event",
    message: "Hackathon registrations are open",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export async function fetchNotifications() {
  Log("backend", "info", "service", "Fetching notifications from evaluation API");

  try {
    const response = await fetch(config.NOTIFICATIONS_API, { headers });

    if (!response.ok) {
      Log("backend", "error", "service",
        `Notifications API responded with status ${response.status}`
      );
      throw new Error(`Notifications API failed: ${response.status}`);
    }

    const data = await response.json();

    Log("backend", "info", "service",
      `Successfully fetched ${data.notifications.length} notifications`
    );

    return data.notifications;
  } catch (err) {
    Log("backend", "warn", "service", `Notifications API failed (${err.message}). Using local fallback mock data.`);
    console.log("⚠️ Notifications API failed. Using local fallback mock notifications.");
    return MOCK_NOTIFICATIONS;
  }
}

export async function getPriorityInbox(n) {
  Log("backend", "info", "service",
    `Priority inbox requested for top ${n} notifications`
  );

  const notifications = await fetchNotifications();

  const topN = getTopNByPriority(notifications, n);

  Log("backend", "info", "service",
    `Priority inbox computed — returning ${topN.length} notifications`
  );

  return topN;
}
