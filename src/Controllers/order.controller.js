import MESSAGE from "../Constants/message.js";
import { Order, Product } from "../Models/index.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";


// note: handle inStock orders in frontend {no validation here}, send me only instock menuItems
const createOrder = asyncHandler(async (req, res) => {
    const {
        menuItems,
        customer,
        served_by,
        tip,
        referral,
        discount,
        paymentId,
        paymentMethod,
        status,
    } = req.body;

    if (!Array.isArray(menuItems) || menuItems.length === 0 || !customer || !served_by || !paymentMethod || !status) {
        throw new ApiError(401, MESSAGE.ALL_FIELDS_MUST_REQUIRED)
    }

    const products = await Product.find({ _id: { $in: menuItems } });
    console.log("products", products);

    let Total = 0;

    const productWithDiscount = products.map(product => {
        let discountedPrice = product.price;

        if (product.isDiscountActive && product.ActiveDiscount > 0) {
            discountedPrice = product.price - (product.price * product.ActiveDiscount / 100);
        }

        Total += discountedPrice;

        return {
            _id: product._id,
            name: product.name,
            originalPrice: product.price,
            discountedPrice
        };
    });
    console.log("total", Total);

    const order = await Order.create({
        menuItems,
        customer,
        served_by,
        tip,
        referral,
        discount,
        paymentId,
        paymentMethod,
        status,
    });
    if (!order) throw new ApiError(500, MESSAGE.ORDER_CREATE_FAILED);

    const savedOrder = await Order.findById(order._id)
        .populate("customer", "name email contact avatar")
        .populate("served_by", "name email contact avatar")
        .lean();

    savedOrder.menuItems = productWithDiscount;

    return res.status(200).json(new ApiResponse(200, { savedOrder, Total }, MESSAGE.ORDER_CREATE_SUCCESS))
});

const updateOrder = asyncHandler(async (req, res) => {
    const {
        menuItems,
        customer,
        served_by,
        tip,
        referral,
        discount,
        paymentId,
        paymentMethod,
        status,
    } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) throw new ApiError(401, MESSAGE.ORDER_NOT_FOUND);

    // if (order.status === "Completed") throw new ApiError(401, MESSAGE.COMPLETED_ORDER_UPDATE_ERROR);

    // // If status is Failed, mark as soft deleted
    // if (status === "Failed") {
    //     order.deletedAt = new Date();
    // }

    if (menuItems) order.menuItems = menuItems;
    if (customer) order.customer = customer;
    if (served_by) order.served_by = served_by;
    if (tip !== undefined) order.tip = tip;
    if (referral) order.referral = referral;
    if (discount !== undefined) order.discount = discount;
    if (paymentId) order.paymentId = paymentId;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (status) order.status = status;

    await order.save();

    return res.status(200).json(new ApiResponse(200, order, MESSAGE.ORDER_UPDATE_SUCCESS));
});

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
            select: "name description price isDiscountActive ActiveDiscount categoryOfProduct", // Only important fields
        })
        .lean();
    if (!order) throw new ApiError(401, MESSAGE.ORDER_NOT_FOUND);

    const menuItems = await Product.find({ _id: { $in: order.menuItems } }).populate("_id name description price").lean();
    console.log(menuItems);

    if (order.menuItems.isDiscountActive) {
        const menuItemsWithDiscountedPrice = order.menuItems.map(item => {
            let discountedPrice = item.price;
            if (item.isDiscountActive && item.ActiveDiscount > 0) {
                discountedPrice = item.price - (item.price * item.ActiveDiscount / 100);
            }
            return {
                ...item,
                originalPrice: item.price,
                discountedPrice: parseFloat(discountedPrice.toFixed(2))
            };
        });

        console.log("menuItemsWithDiscountedPrice", menuItemsWithDiscountedPrice);
        order.menuItems = menuItemsWithDiscountedPrice;
    }


    return res.status(200).json(new ApiResponse(200, order, MESSAGE.ORDER_FOUND_SUCCESS))
});

// Soft delete on clicking on delete button in frontend
// TODO: implementation of auto soft delete After some time
const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(id, { deletedAt: new Date() });
    if (!order) throw new ApiError(400, MESSAGE.ORDER_DELETE_FAILED);

    return res.status(200).json(new ApiResponse(200, MESSAGE.ORDER_DELETE_SUCCESS));
})

const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortType = "desc", sortBy = "createdAt" } = req.query;

    const sortOptions = {};
    const validSortFields = ["createdAt", "updatedAt"];
    const sortDirection = sortType === "asc" ? 1 : -1;

    // Validate and set sort field
    if (validSortFields.includes(sortBy)) {
        sortOptions[sortBy] = sortDirection;
    } else {
        sortOptions["createdAt"] = -1;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find()
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("customer", "name email contact avatar")
        .populate("served_by", "name email contact avatar")
        .populate({
            path: "menuItems",
            populate: {
                path: "categoryOfProduct",
                select: "categoryName categoryThumbnail",
            },
            select: "name description price isDiscountActive ActiveDiscount categoryOfProduct", // Only important fields
        })

    const total = await Order.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            orders,
        }, MESSAGE.DATA_FETCHED_SUCCESS)
    );
})

// const failedOrderSoftDelete = asyncHandler(async (req, res) => {
// })

export {
    createOrder,
    // failedOrderSoftDelete,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder
}