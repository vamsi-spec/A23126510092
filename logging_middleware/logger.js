import * as dotenv from "dotenv";
dotenv.config();

const LOG_API = "http://20.244.56.144/evaluation-service/logs";

const authToken = process.env.AUTH_TOKEN || "";

async function Log(stack, level, pkg, message) {
  try {
    await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message
      })
    });
  } catch (err) {
    console.error("Logging failed:", err);
  }
}

export default Log;