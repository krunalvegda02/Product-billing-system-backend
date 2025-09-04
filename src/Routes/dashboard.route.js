import { Router } from "express";
import { API } from "../Constants/endpoints.js";
import {  getDashboardData , getDashOrders} from "../Controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get(API.DASHBOARD.GET_DASHBOARD_DATA, getDashboardData);
dashboardRouter.get(API.DASHBOARD.GET_DASHBOARD_ORDERS, getDashOrders);


export default dashboardRouter