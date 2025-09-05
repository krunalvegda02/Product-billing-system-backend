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


import {
  userRouter,
  categoryRouter,
  productRouter,
  orderRouter,
  feedbackRouter,
  dashboardRouter,
  billingRouter,
  paymentRouter
} from "./Routes/index.js"

import { ROUTE } from "./Constants/endpoints.js"

//Routes declaration
app.use(ROUTE.USER_ROUTER, userRouter);
app.use(ROUTE.CATEGORY_ROUTER, categoryRouter);
app.use(ROUTE.PRODUCT_ROUTER, productRouter);
app.use(ROUTE.ORDER_ROUTER, orderRouter);
app.use(ROUTE.DASHBOARD_ROUTER, dashboardRouter);
app.use(ROUTE.FEEDBACK_ROUTER, feedbackRouter);
app.use(ROUTE.BILLING_ROUTER, billingRouter);
app.use("/api/v1/payments", paymentRouter);

export default app;