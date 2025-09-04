import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import MESSAGE from "../Constants/message.js";
import Order from "../Models/order.model.js";
import Product from "../Models/product.model.js";
import User from "../Models/user.model.js";

const getDashboardData = asyncHandler(async (req, res) => {
    const { duration } = req.query;

    // ✅ 1. Calculate startDate safely
    let startDate = null;
    switch (duration) {
        case "lastWeek": {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            break;
        }
        case "lastMonth": {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        }
        case "last6Months": {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        }
        default:
            startDate = null; // All-time
    }

    if (startDate) startDate.setHours(0, 0, 0, 0);

    // ✅ 2. Build filter
    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};
    const matchStage = { ...dateFilter, status: "COMPLETED" };

    // ✅ 3. Run queries in parallel
    const [
        totalRevenueAgg,
        customersServedAgg,
        totalServedOrders,
        totalProducts,
        popularProducts,
        salesByCategory,
        totalStaff,
        topPerformers
    ] = await Promise.all([
        // Revenue
        Order.aggregate([
            { $match: matchStage },
            { $group: { _id: null, revenue: { $sum: "$total" } } },
        ]),

        // Customers served
        Order.aggregate([
            { $match: matchStage },
            { $group: { _id: "$customer" } },
            { $count: "uniqueCustomers" },
        ]),

        // Total served orders
        Order.countDocuments(matchStage),

        // Total products
        Product.countDocuments(),

        // Popular products (top 5)
        Order.aggregate([
            { $match: matchStage },
            { $unwind: "$menuItems" },
            {
                $group: {
                    _id: "$menuItems.productId",
                    totalQuantity: { $sum: "$menuItems.quantity" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 0,
                    productId: "$product._id",
                    name: "$product.name",
                    totalQuantity: 1,
                    price: "$product.price",
                    thumbnail: "$product.thumbnail",
                },
            },
        ]),

        // Sales By Category (Equal Distribution)
        Order.aggregate([
            { $match: matchStage },
            { $unwind: "$menuItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "menuItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $addFields: {
                    itemTotalAmount: {
                        $multiply: ["$productDetails.price", "$menuItems.quantity"]
                    },
                    categoryCount: { $size: "$productDetails.categoryOfProduct" }
                }
            },
            { $unwind: "$productDetails.categoryOfProduct" },
            {
                $addFields: {
                    categoryAmount: {
                        $divide: ["$itemTotalAmount", "$categoryCount"]
                    }
                }
            },
            {
                $group: {
                    _id: "$productDetails.categoryOfProduct",
                    totalSales: { $sum: "$categoryAmount" },
                    itemCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: null,
                    categories: {
                        $push: {
                            categoryId: "$_id",
                            categoryName: "$categoryDetails.categoryName",
                            totalSales: "$totalSales",
                            itemCount: "$itemCount"
                        }
                    },
                    grandTotal: { $sum: "$totalSales" }
                }
            },
            { $unwind: "$categories" },
            {
                $project: {
                    _id: 0,
                    categoryId: "$categories.categoryId",
                    categoryName: "$categories.categoryName",
                    totalSales: { $round: ["$categories.totalSales", 2] },
                    itemCount: "$categories.itemCount",
                    percentage: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ["$categories.totalSales", "$grandTotal"] },
                                    100
                                ]
                            },
                            1
                        ]
                    }
                }
            },
            { $sort: { percentage: -1 } }
        ]),

        // Staff count
        User.countDocuments({ role: { $in: ["MANAGER", "WAITER"] } }),

        // Top performers
        Order.aggregate([
            { $match: { served_by: { $ne: null } } },
            { $group: { _id: "$served_by", totalOrders: { $sum: 1 } } },
            { $sort: { totalOrders: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    waiterId: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    totalOrders: 1
                }
            }
        ])
    ]);

    // ✅ Final values
    const totalRevenue = totalRevenueAgg[0]?.revenue || 0;
    const customersServed = customersServedAgg[0]?.uniqueCustomers || 0;
    const avgOrderValue = totalServedOrders ? totalRevenue / totalServedOrders : 0;

    // ✅ Response
    res.status(200).json({
        success: true,
        data: {
            revenue: totalRevenue,
            customersServed,
            totalServedOrders,
            avgOrderValue,
            totalProducts,
            popularProducts,
            salesByCategory,
            staff: {
                total: totalStaff,
                onDuty: totalStaff // TODO: update if you track onDuty
            },
            topPerformers
        },
    });
});


const getDashOrders = asyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
        {
            $lookup: {
                from: "users",              // collection name for User model
                localField: "customer",     // field in Order
                foreignField: "_id",        // join on _id
                as: "customer",
                pipeline: [
                    {
                        $project: {             // pick only required fields
                            username: 1,
                            contact: 1,
                            _id: 0                // remove _id if you don’t need it
                        }
                    }
                ]
            }
        },
        { $unwind: "$customer" },
        {
            $addFields: {
                itemsCount: { $size: "$menuItems" },
            },
        },
        {
            $project: {
                menuItems: 0,
                paymentId: 0,
                tip: 0,
                isLocked: 0,
                referral: 0,
                paymentMethod: 0,
                deletedAt: 0,
                __v: 0,
                served_by: 0,
                updatedAt: 0,
            },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 4  },
    ]);



    return res.status(200).json(new ApiResponse(200,
        orders,
        MESSAGE.DATA_FETCHED_SUCCESS));
});

export { getDashboardData, getDashOrders };
