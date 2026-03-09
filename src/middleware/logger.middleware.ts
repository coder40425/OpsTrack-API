import pinoHttp from "pino-http";

//pino-http automatically logs every request
export const httpLogger = pinoHttp();