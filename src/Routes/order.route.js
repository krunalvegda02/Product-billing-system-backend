import { Router } from "express";
import { API } from "../Constants/endpoints.js";
import {
    createOrder,
    deleteOrder,
    getAllOrders,
    getOrderById,
    updateOrder
} from "../Controllers/order.controller.js";

const orderRouter = Router();

orderRouter.route(API.ORDER.CREATE_ORDER).post(createOrder);
orderRouter.route(API.ORDER.DELETE_ORDER).delete(deleteOrder);
orderRouter.route(API.ORDER.UPDATE_ORDER).patch(updateOrder);
orderRouter.route(API.ORDER.GET_ALL_ORDER).get(getAllOrders);
orderRouter.route(API.ORDER.GET_ORDERBY_ID).get(getOrderById);

export default orderRouter;