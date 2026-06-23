import Log from "../../../logging_middleware/logger.js";
import { scheduleVehicles, fetchDepots, fetchVehicles } from "../services/scheduleServices.js";

export const getSchedule = async (req, res) => {
  const { depotId } = req.body;

  Log("backend", "info", "controller", `POST /api/schedule called with depotId: ${depotId}`);

  if (depotId === undefined || depotId === null) {
    Log("backend", "warn", "controller", "depotId is missing in request body");
    return res.status(400).json({ error: "depotId is required in request body" });
  }

  if (typeof depotId !== "number") {
    Log("backend", "warn", "controller", `Invalid depotId type: expected number, got ${typeof depotId}`);
    return res.status(400).json({ error: "depotId must be a number" });
  }

  try {
    const result = await scheduleVehicles(depotId);
    Log("backend", "info", "controller", `Schedule response sent for depotId: ${depotId}`);
    return res.status(200).json(result);
  } catch (err) {
    Log("backend", "error", "controller", `Schedule computation failed: ${err.message}`);

    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDepots = async (req, res) => {
  Log("backend", "info", "controller", "GET /api/depots called");
  try {
    const depots = await fetchDepots();
    return res.status(200).json({ depots });
  } catch (err) {
    Log("backend", "error", "controller", `Failed to fetch depots: ${err.message}`);
    return res.status(500).json({ error: "Failed to fetch depots" });
  }
};

export const getVehicles = async (req, res) => {
  Log("backend", "info", "controller", "GET /api/vehicles called");
  try {
    const vehicles = await fetchVehicles();
    return res.status(200).json({ vehicles });
  } catch (err) {
    Log("backend", "error", "controller", `Failed to fetch vehicles: ${err.message}`);
    return res.status(500).json({ error: "Failed to fetch vehicles" });
  }
};
