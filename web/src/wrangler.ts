/**
 * ! Do not import this on the frontend
 */
import wranglerConfig from "../../wrangler.toml";

const main_url = {
  dev: wranglerConfig.vars.MAIN_URL,
  prod: wranglerConfig.env.production.vars.MAIN_URL,
};

const isProd = import.meta.env.PROD ?? process.env.NODE_ENV === "production";

export const MAIN_URL = main_url[isProd ? "prod" : "dev"];

console.info(`Using main URL: ${MAIN_URL}`);
