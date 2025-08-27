import MESSAGE from "../Constants/message.js";
import { Order, Product } from "../Models/index.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { io } from "../index.js";

/**
 * Create a new order
 */
const createOrder = asyncHandler(async (req, res) => {
    const {
        menuItems,
        customer,
        served_by,
        tip = 0,
        referral = "",
        discount = 0,
        paymentId = "",
        paymentMethod,
        status = "Pending",
    } = req.body;

    // 1. Validation
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
        throw new ApiError(400, MESSAGE.MENU_ITEMS_REQUIRED);
    }
    if (!customer) {
        throw new ApiError(400, MESSAGE.CUSTOMER_REQUIRED);
    }
    if (!paymentMethod) {
        throw new ApiError(400, MESSAGE.PAYMENT_METHOD_REQUIRED);
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the last order of the day
    const lastOrder = await Order.findOne({
        createdAt: {
            $gte: today,
            $lt: tomorrow
        }
    }).sort({ orderId: -1 });
    let orderNumber = 1

    if (lastOrder && lastOrder.orderId) {
        // Extract number from last order ID (ORD-123 → 123)
        const lastNumber = parseInt(lastOrder.orderId.split('-')[1], 10);
        if (!isNaN(lastNumber)) {
            orderNumber = lastNumber + 1;
        }
    }
    const orderId = `ORD-${orderNumber}`;


    // 2. Extract product IDs
    const productIds = menuItems.map(item => item.productId);

    // 3. Fetch product details
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== menuItems.length) {
        throw new ApiError(400, MESSAGE.INVALID_PRODUCT);
    }

    // 4. Calculate totals with discounts
    let Total = 0;
    const productWithDiscount = products.map(product => {
        let discountedPrice = product.price;

        if (product.isDiscountActive && product.ActiveDiscount > 0) {
            discountedPrice -= (product.price * product.ActiveDiscount) / 100;
        }

        const matchedItem = menuItems.find(
            item => item.productId.toString() === product._id.toString()
        );
        const quantity = matchedItem ? matchedItem.quantity : 1;

        const totalItemPrice = discountedPrice * quantity;
        Total += totalItemPrice;



        return {
            _id: product._id,
            name: product.name,
            originalPrice: product.price,
            discountedPrice: parseFloat(discountedPrice.toFixed(2)),
            quantity,
            totalItemPrice: parseFloat(totalItemPrice.toFixed(2)),
        };
    });

    // 5. Apply referral/discount if applicable
    if (discount > 0) {
        Total -= (Total * discount) / 100;
    }
    if (Total < 0) Total = 0;

    // 6. Save order
    const order = await Order.create({
        orderId,
        menuItems,
        customer,
        served_by,
        tip,
        referral,
        discount,
        paymentId,
        paymentMethod,
        status,
        total: Total.toFixed(2),
    });

    if (!order) {
        throw new ApiError(500, MESSAGE.ORDER_CREATE_FAILED);
    }

    // 7. Populate customer & served_by
    const savedOrder = await Order.findById(order._id)
        .populate("customer", "name email contact avatar")
        .populate("served_by", "name email contact avatar")
        .lean();

    savedOrder.menuItems = productWithDiscount;

    // 8. Emit socket event for real-time kitchen update
    console.log("Socket instance:", io);
    if (!io) {
        console.error("⚠ Socket.io instance not found in req.app");
    } else {
        io.emit("new-order", savedOrder);
        console.log("✅ Emitted new-order event");
    }

    // 9. Response
    return res.status(201).json(
        new ApiResponse(
            201,
            {
                savedOrder,
                Total: parseFloat(Total.toFixed(2)),
            },
            MESSAGE.ORDER_CREATE_SUCCESS
        )
    );
});





/**
 * Full control update order (Admin/Staff)
 */
const updateOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, MESSAGE.ORDER_NOT_FOUND);

    if (order.status !== "Pending") {
        throw new ApiError(400, MESSAGE.COMPLETED_ORDER_UPDATE_ERROR);
    }

    Object.assign(order, updates);
    await order.save();

    return res.status(200).json(new ApiResponse(200, order, MESSAGE.ORDER_UPDATE_SUCCESS));
});




/**
 * Update order by customer
 */
const updateOrderByCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { menuItems } = req.body;

    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, MESSAGE.ORDER_NOT_FOUND);

    if (order.isLocked || !["Pending", "Accepted"].includes(order.status)) {
        throw new ApiError(403, "Order can no longer be updated");
    }

    const gracePeriodMs = 2 * 60 * 1000;
    if (Date.now() - new Date(order.createdAt).getTime() > gracePeriodMs) {
        throw new ApiError(403, "Update window has expired");
    }

    if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
        order.menuItems = menuItems;
    }

    await order.save();
    return res.status(200).json(new ApiResponse(200, order, MESSAGE.ORDER_UPDATE_SUCCESS));
});



/**
 * Update order status (Admin/Staff)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    console.log(data);


    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, MESSAGE.ORDER_NOT_FOUND);

    const allowedTransitions = {
        PENDING: ["PREPARING", "CANCELLED", "FAILED"],
        PREPARING: ["READY", "FAILED"],
        READY: ["COMPLETED", "FAILED"],
        COMPLETED: [],
        FAILED: [],
        CANCELLED: []
    };


    if (!allowedTransitions[order.status].includes(data.status)) {
        throw new ApiError(400, `Cannot change status from ${order.status} to ${data.status}`);
    }

    order.status = data.status;
    if (data.served_by) order.served_by = data.served_by;

    await order.save();
    return res.status(200).json(new ApiResponse(200, order, MESSAGE.ORDER_STATUS_UPDATED));
});





/**
 * Cancel order
 */
const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) throw new ApiError(404, MESSAGE.ORDER_NOT_FOUND);
    if (order.status !== "Pending") {
        throw new ApiError(400, "Only pending orders can be cancelled");
    }

    order.status = "Cancelled";
    await order.save();

    return res.status(200).json(new ApiResponse(200, order, MESSAGE.ORDER_STATUS_UPDATED));
});





/**
 * Get order by ID
 */
const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id)
        .populate("customer", "name email contact avatar")
        .populate("served_by", "name email contact avatar")
        .populate({
            path: "menuItems",
            populate: {
                path: "categoryOfProduct",
                select: "categoryName categoryThumbnail",
            },
            select: "name description price isDiscountActive ActiveDiscount categoryOfProduct",
        })
        .lean();

    if (!order) throw new ApiError(404, MESSAGE.ORDER_NOT_FOUND);

    order.menuItems = order.menuItems.map(item => {
        let discountedPrice = item.price;
        if (item.isDiscountActive && item.ActiveDiscount > 0) {
            discountedPrice -= (item.price * item.ActiveDiscount) / 100;
        }
        return {
            ...item,
            originalPrice: item.price,
            discountedPrice: parseFloat(discountedPrice.toFixed(2))
        };
    });

    return res.status(200).json(new ApiResponse(200, order, MESSAGE.ORDER_FOUND_SUCCESS));
});




/**
 * Soft delete order
 */
const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(id, { deletedAt: new Date() });
    if (!order) throw new ApiError(400, MESSAGE.ORDER_DELETE_FAILED);

    return res.status(200).json(new ApiResponse(200, MESSAGE.ORDER_DELETE_SUCCESS));
});




/**
 * Get all orders with pagination  WHICH STATUS IS COMPLETED
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortType = "desc", sortBy = "createdAt" } = req.query;

    const sortOptions = {};
    const validSortFields = ["createdAt", "updatedAt"];
    const sortDirection = sortType === "asc" ? 1 : -1;

    if (validSortFields.includes(sortBy)) {
        sortOptions[sortBy] = sortDirection;
    } else {
        sortOptions["createdAt"] = -1;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find({ status: { $ne: "COMPLETED" } })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("customer", "username email contact avatar")
        .populate("served_by", "username email contact avatar")
        .populate({
            path: "menuItems.productId",
            populate: {
                path: "categoryOfProduct",
                select: "categoryName categoryThumbnail",
            },
            select: "name description price isDiscountActive ActiveDiscount categoryOfProduct",
        });

    const total = await Order.countDocuments();

    return res.status(200).json(new ApiResponse(200, {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        orders,
    }, MESSAGE.DATA_FETCHED_SUCCESS));
});




export {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    updateOrderByCustomer,
    updateOrderStatus,
    cancelOrder,
    deleteOrder
};
