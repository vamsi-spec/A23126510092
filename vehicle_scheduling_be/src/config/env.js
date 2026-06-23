import * as dotenv from "dotenv";
dotenv.config()

export const config = {
    PORT: 3000,
    AUTH_TOKEN: process.env.AUTH_TOKEN ||  "",
    DEPOTS_API: "http://20.244.56.144/evaluation-service/depots",
    VEHICLES_API: "http://20.244.56.144/evaluation-service/vehicles",
}

if(!config.AUTH_TOKEN) {
    console.error("AUTH_TOKEN is missing in .env");
    process.exit(1);
}