import "dotenv/config.js";

import connectWithDb from "./db/connect.js";
connectWithDb();

import { app } from "./app.js";

const PORT = process.env.PORT || 3030;
const server = app.listen(PORT, () => {
  console.log("Listening on port:", PORT);
});

server.on("error", (error) => {
  console.log("Error: ", error.message);
  process.exit(1);
});
