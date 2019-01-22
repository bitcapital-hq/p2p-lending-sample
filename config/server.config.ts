import { Logger } from 'ts-framework-common';
import { files } from 'pjson';

// Prepare server port
const port = process.env.PORT as any || 3000;


// Prepare global logger instance
const sentry = process.env.SENTRY_DSN ? { dsn: process.env.SENTRY_DSN } : undefined;
const logger = Logger.getInstance({ sentry });

export default {
  logger,
  sentry,
  port,
  request: { multer: {fields: [{name: 'files', maxCount: 2}]} }
}
