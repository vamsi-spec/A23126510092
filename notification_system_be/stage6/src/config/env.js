import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config({ path: resolve(__dirname, "../../.env") });

const config = {
  PORT: process.env.PORT || 4000,
  AUTH_TOKEN: process.env.AUTH_TOKEN || "",
  NOTIFICATIONS_API: "http://4.224.186.213/evaluation-service/notifications",
};

if (!config.AUTH_TOKEN) {
  console.error("AUTH_TOKEN is missing in .env");
  process.exit(1);
}

export default config;
