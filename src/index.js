import "dotenv/config.js";

import connectWithDb from "./db/connect.js";
connectWithDb();

process.on("uncaughtException", (ex) => {
  console.log("Uncaught exception occured!");
});

process.on("unhandledRejection", (ex) => {
  console.log("Unhandles rejection occured!");
});

import { app } from "./app.js";

const PORT = process.env.PORT || 3030;
const server = app.listen(PORT, () => {
  console.log("Listening on port:", PORT);
});

server.on("error", (error) => {
  console.log("Error: ", error.message);
  process.exit(1);
});
