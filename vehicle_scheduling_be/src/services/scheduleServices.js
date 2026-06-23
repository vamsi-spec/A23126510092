import Log from "../../../logging_middleware/logger.js";
import { config } from "../config/env.js";
import { knapsack } from "../utils/knapsack.js";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${config.AUTH_TOKEN}`,
};

export const fetchDepots = async () => {
  const response = await fetch(config.DEPOTS_API, { headers });
  if (!response.ok) {
    Log(
      "backend",
      "error",
      "service",
      `Depots API failed with status ${response.status}`
    );
    throw new Error(`Failed to fetch depots: ${response.status}`);
  }
  const data = await response.json();
  return data.depots;
};

export const fetchVehicles = async () => {
  const response = await fetch(config.VEHICLES_API, { headers });
  if (!response.ok) {
    Log(
      "backend",
      "error",
      "service",
      `Vehicles API failed with status ${response.status}`
    );
    throw new Error(`Failed to fetch vehicles: ${response.status}`);
  }
  const data = await response.json();
  return data.vehicles;
};

export const scheduleVehicles = async (depotId) => {
  Log(
    "backend",
    "info",
    "service",
    `Starting schedule computation for depotId: ${depotId}`
  );

  const [depots, vehicles] = await Promise.all([
    fetchDepots(),
    fetchVehicles(),
  ]);

  const depot = depots.find(({ ID }) => ID === depotId);
  if (!depot) {
    Log(
      "backend",
      "warn",
      "service",
      `Depot with ID ${depotId} not found`
    );
    throw new Error(`Depot with ID ${depotId} not found`);
  }

  const capacity = depot.MechanicHours;
  const result = knapsack(vehicles, capacity);

  Log(
    "backend",
    "info",
    "service",
    `Schedule complete for depot ${depotId} — selected ${result.selectedVehicles.length} vehicles`
  );

  return {
    depotId: depot.ID,
    mechanicHours: capacity,
    totalVehiclesConsidered: vehicles.length,
    selectedVehicles: result.selectedVehicles,
    totalDuration: result.totalDuration,
    totalImpact: result.totalImpact,
  };
};