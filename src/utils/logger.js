import debug from "debug";

const dbLogger = debug("db");
const logger = debug("logs");
const startupLogger = debug("startup");

// logger.enabled = true;
export { dbLogger, logger, startupLogger };
