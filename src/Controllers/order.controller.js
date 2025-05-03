import { Product } from "../Models";
import { ApiError } from "../Utils/ApiError";
import { ApiResponse } from "../Utils/ApiResponse";
import { asyncHandler } from "../Utils/AsyncHandler";

const createOrder = asyncHandler(async (req, res) => {

});

const updateOrder = asyncHandler(async (req, res) => {

});

// get orders by sorting, 
const getAllOrders = asyncHandler(async (req, res) => {

});

const getOrderById = asyncHandler(async (req, res) => {

});

export {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
}