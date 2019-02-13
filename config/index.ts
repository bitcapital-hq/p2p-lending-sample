if (!process.env.PORT) {
  require("dotenv").config();
}

import server from "./server.config";
import database from "./database.config";

export default {
  server,
  database,
}
