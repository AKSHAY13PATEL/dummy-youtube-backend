import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import error from "./middlewares/error.middleware.js";
import ApiResponse from "./utils/ApiResponse.js";
import ApiError from "./utils/ApiError.js";

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

// log request only in development environment
if (app.get("env") == "development") {
  app.use(morgan("tiny"));
  console.log("Morgan enabled!");
}

app.get("/home", async (req, res) => {
  new ApiResponse(res, true, 200, "all goods", null, { fullname: "hello" });
  // new ApiError(res, 500, "error message", "internal server error");
});

// routes imports
import user from "./routes/user.route.js";
import subscriber from "./routes/subscriber.route.js";
import channel from "./routes/channel.route.js";
import morgan from "morgan";

//routes middleware
app.use("/api/v1", user);
app.use("/api/v1", subscriber);
app.use("/api/v1", channel);

// error handling middleware
app.use(error);

export { app };
