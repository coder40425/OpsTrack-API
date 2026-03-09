import pino from "pino";

//create logger instance
export const logger = pino({
    level: "info" //log info, warn, error and above
});

