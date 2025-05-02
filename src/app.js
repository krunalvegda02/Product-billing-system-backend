import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);


app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());


import { userRouter } from "./Routes/user.route.js"
import { ROUTE } from "./Constants/endpoints.js"

//Roues declaration
app.use(ROUTE.USER_ROUTER, userRouter);

export default app;