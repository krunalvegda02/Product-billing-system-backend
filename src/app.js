import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"

dotenv.config();

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


import { userRouter, categoryRouter } from "./Routes/index.js"

import { ROUTE } from "./Constants/endpoints.js"

//Roues declaration
app.use(ROUTE.USER_ROUTER, userRouter);
app.use(ROUTE.CATEGORY_ROUTER, categoryRouter);


export default app;