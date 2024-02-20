import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import error from "./middlewares/error.middleware.js";

const app = express();

//middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

// routes imports
import user from "./routes/user.route.js";

//routes middleware
app.use("/api/v1/user", user);

// error handling middleware
app.use(error);

export { app };
