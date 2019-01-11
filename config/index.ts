import * as dotenv from 'dotenv';
dotenv.config();

import server from './server.config';
import database from './database.config';

export default {
  server,
  database,
}
