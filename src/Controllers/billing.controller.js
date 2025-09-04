import { asyncHandler } from "../Utils/AsyncHandler.js";
import Order from "../Models/order.model.js";
import User from "../Models/user.model.js";
import mongoose from "mongoose"; // ✅ Added missing import

// ✅ Get all bills/invoices with filtering and search
const getBills = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 50, dateFrom, dateTo } = req.query;

    // Build filter conditions
    let matchConditions = {
        deletedAt: null, // Only non-deleted orders
        status: { $in: ["COMPLETED", "FAILED", "CANCELLED"] } // Only finalized orders for billing
    };

    // Status filter
    if (status && status !== 'all') {
        switch (status) {
            case 'paid':
                matchConditions.status = "COMPLETED";
                break;
            case 'pending':
                matchConditions.status = { $in: ["PENDING", "PREPARING", "READY"] };
                break;
            case 'partial':
                // For partial payments, you might need additional logic
                // For now, treating as completed with potential partial payments
                matchConditions.status = "COMPLETED";
                break;
            case 'failed':
                matchConditions.status = { $in: ["FAILED", "CANCELLED"] };
                break;
        }
    }

    // Date range filter
    if (dateFrom || dateTo) {
        matchConditions.createdAt = {};
        if (dateFrom) matchConditions.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999); // End of day
            matchConditions.createdAt.$lte = endDate;
        }
    }

    // Build aggregation pipeline
    const pipeline = [
        { $match: matchConditions },
        
        // Lookup customer details
        {
            $lookup: {
                from: "users",
                localField: "customer",
                foreignField: "_id",
                as: "customerDetails"
            }
        },
        { $unwind: { path: "$customerDetails", preserveNullAndEmptyArrays: true } },
        
        // Add calculated fields
        {
            $addFields: {
                customerName: {
                    $ifNull: [
                        "$customerDetails.username",
                        { $ifNull: ["$customerDetails.email", "Unknown Customer"] }
                    ]
                },
                itemCount: { $size: "$menuItems" },
                // Map order status to billing status
                billingStatus: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$status", "COMPLETED"] }, then: "paid" },
                            { case: { $eq: ["$status", "FAILED"] }, then: "failed" },
                            { case: { $eq: ["$status", "CANCELLED"] }, then: "cancelled" },
                            { case: { $in: ["$status", ["PENDING", "PREPARING", "READY"]] }, then: "pending" }
                        ],
                        default: "pending"
                    }
                },
                // Calculate paid amount (for completed orders, assume fully paid)
                paidAmount: {
                    $cond: {
                        if: { $eq: ["$status", "COMPLETED"] },
                        then: "$total",
                        else: 0
                    }
                },
                // Format dates
                formattedDate: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                },
                formattedDueDate: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: {
                            $dateAdd: {
                                startDate: "$createdAt",
                                unit: "day", 
                                amount: 30
                            }
                        }
                    }
                }
            }
        },
        
        // Search filter (applied after customer lookup)
        ...(search ? [{
            $match: {
                $or: [
                    { orderId: { $regex: search, $options: 'i' } },
                    { customerName: { $regex: search, $options: 'i' } },
                    { "customerDetails.email": { $regex: search, $options: 'i' } }
                ]
            }
        }] : []),
        
        // Project final structure
        {
            $project: {
                id: "$orderId",
                customer: "$customerName",
                customerEmail: "$customerDetails.email",
                date: "$formattedDate",
                dueDate: "$formattedDueDate",
                amount: "$total",
                paid: "$paidAmount",
                discount: "$discount",
                tip: "$tip",
                paymentMethod: "$paymentMethod",
                paymentId: "$paymentId",
                status: "$billingStatus",
                items: "$itemCount",
                menuItems: "$menuItems",
                referral: "$referral",
                isLocked: "$isLocked",
                originalStatus: "$status",
                createdAt: "$createdAt",
                updatedAt: "$updatedAt",
                _id: "$_id"
            }
        },
        
        // Sort by creation date (newest first)
        { $sort: { createdAt: -1 } }
    ];

    // Execute aggregation with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const billsPipeline = [...pipeline, { $skip: skip }, { $limit: parseInt(limit) }];
    
    const [bills, totalCount, summary] = await Promise.all([
        Order.aggregate(billsPipeline),
        Order.aggregate([...pipeline, { $count: "total" }]),
        Order.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: "users",
                    localField: "customer", 
                    foreignField: "_id",
                    as: "customerDetails"
                }
            },
            {
                $addFields: {
                    paidAmount: {
                        $cond: {
                            if: { $eq: ["$status", "COMPLETED"] },
                            then: "$total",
                            else: 0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$total" },
                    totalPaid: { $sum: "$paidAmount" },
                    totalDiscount: { $sum: "$discount" },
                    totalTips: { $sum: "$tip" },
                    count: { $sum: 1 }
                }
            }
        ])
    ]);

    const total = totalCount[0]?.total || 0;
    const summaryData = summary[0] || {
        totalAmount: 0,
        totalPaid: 0,
        totalDiscount: 0,
        totalTips: 0,
        count: 0
    };

    const totalDue = summaryData.totalAmount - summaryData.totalPaid;

    res.status(200).json({
        success: true,
        data: {
            bills,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                count: bills.length,
                totalRecords: total
            },
            summary: {
                totalAmount: summaryData.totalAmount,
                totalPaid: summaryData.totalPaid,
                totalDue: totalDue,
                totalDiscount: summaryData.totalDiscount,
                totalTips: summaryData.totalTips,
                totalBills: summaryData.count
            }
        }
    });
});

// ✅ Get individual invoice/bill details
 const getInvoiceDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // Handle both orderId string and MongoDB ObjectId
    let matchCondition;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
        matchCondition = {
            $or: [
                { orderId: orderId },
                { _id: new mongoose.Types.ObjectId(orderId) }
            ]
        };
    } else {
        matchCondition = { orderId: orderId };
    }

    const invoice = await Order.aggregate([
        {
            $match: {
                ...matchCondition,
                deletedAt: null
            }
        },
        
        // Lookup customer details
        {
            $lookup: {
                from: "users",
                localField: "customer",
                foreignField: "_id",
                as: "customerDetails"
            }
        },
        { $unwind: { path: "$customerDetails", preserveNullAndEmptyArrays: true } },
        
        // Lookup product details for menu items
        {
            $lookup: {
                from: "products",
                localField: "menuItems.productId",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        
        // Process menu items with product details
        {
            $addFields: {
                processedMenuItems: {
                    $map: {
                        input: "$menuItems",
                        as: "menuItem",
                        in: {
                            $let: {
                                vars: {
                                    product: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$productDetails",
                                                    cond: { $eq: ["$$this._id", "$$menuItem.productId"] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                in: {
                                    productId: "$$menuItem.productId",
                                    quantity: "$$menuItem.quantity",
                                    name: { $ifNull: ["$$product.name", "Unknown Product"] },
                                    price: { $ifNull: ["$$product.price", 0] },
                                    thumbnail: "$$product.thumbnail",
                                    description: "$$product.description",
                                    totalPrice: { 
                                        $multiply: [
                                            { $ifNull: ["$$product.price", 0] }, 
                                            "$$menuItem.quantity"
                                        ] 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        
        // Project final invoice structure
        {
            $project: {
                id: "$orderId",
                customer: {
                    name: { $ifNull: ["$customerDetails.username", "Unknown Customer"] },
                    email: "$customerDetails.email",
                    phone: "$customerDetails.phone",
                    id: "$customerDetails._id"
                },
                date: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                },
                dueDate: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: {
                            $dateAdd: {
                                startDate: "$createdAt",
                                unit: "day",
                                amount: 30
                            }
                        }
                    }
                },
                amount: "$total",
                paid: {
                    $cond: {
                        if: { $eq: ["$status", "COMPLETED"] },
                        then: "$total",
                        else: 0
                    }
                },
                discount: "$discount",
                tip: "$tip",
                paymentMethod: "$paymentMethod",
                paymentId: "$paymentId",
                status: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$status", "COMPLETED"] }, then: "paid" },
                            { case: { $eq: ["$status", "FAILED"] }, then: "failed" },
                            { case: { $eq: ["$status", "CANCELLED"] }, then: "cancelled" },
                            { case: { $in: ["$status", ["PENDING", "PREPARING", "READY"]] }, then: "pending" }
                        ],
                        default: "pending"
                    }
                },
                originalStatus: "$status",
                items: "$processedMenuItems",
                itemCount: { $size: "$menuItems" },
                subtotal: { $add: ["$total", "$discount"] }, // Original amount before discount
                referral: "$referral",
                isLocked: "$isLocked",
                createdAt: "$createdAt",
                updatedAt: "$updatedAt",
                _id: "$_id"
            }
        }
    ]);

    if (!invoice || invoice.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Invoice not found"
        });
    }

    const invoiceData = invoice[0];
    const balanceDue = invoiceData.amount - invoiceData.paid;

    res.status(200).json({
        success: true,
        data: {
            ...invoiceData,
            balanceDue: balanceDue > 0 ? balanceDue : 0
        }
    });
});

// ✅ Get billing dashboard summary
const getBillingSummary = asyncHandler(async (req, res) => {
    const { period = 'all' } = req.query; // all, today, week, month, year

    // Calculate date range based on period
    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
            break;
        
        case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: startOfWeek } };
            break;
            
        case 'month':
            const startOfMonth = new Date(now);
            startOfMonth.setMonth(now.getMonth() - 1);
            dateFilter = { createdAt: { $gte: startOfMonth } };
            break;
            
        case 'year':
            const startOfYear = new Date(now);
            startOfYear.setFullYear(now.getFullYear() - 1);
            dateFilter = { createdAt: { $gte: startOfYear } };
            break;
            
        default:
            dateFilter = {}; // All time
    }

    const summary = await Order.aggregate([
        {
            $match: {
                deletedAt: null,
                status: { $in: ["COMPLETED", "FAILED", "CANCELLED", "PENDING", "PREPARING", "READY"] },
                ...dateFilter
            }
        },
        {
            $addFields: {
                paidAmount: {
                    $cond: {
                        if: { $eq: ["$status", "COMPLETED"] },
                        then: "$total",
                        else: 0
                    }
                },
                billingStatus: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$status", "COMPLETED"] }, then: "paid" },
                            { case: { $eq: ["$status", "FAILED"] }, then: "failed" },
                            { case: { $eq: ["$status", "CANCELLED"] }, then: "cancelled" },
                            { case: { $in: ["$status", ["PENDING", "PREPARING", "READY"]] }, then: "pending" }
                        ],
                        default: "pending"
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$total" },
                totalPaid: { $sum: "$paidAmount" },
                totalDiscount: { $sum: "$discount" },
                totalTips: { $sum: "$tip" },
                totalInvoices: { $sum: 1 },
                
                // Status-wise counts
                paidInvoices: {
                    $sum: { $cond: [{ $eq: ["$billingStatus", "paid"] }, 1, 0] }
                },
                pendingInvoices: {
                    $sum: { $cond: [{ $eq: ["$billingStatus", "pending"] }, 1, 0] }
                },
                failedInvoices: {
                    $sum: { $cond: [{ $eq: ["$billingStatus", "failed"] }, 1, 0] }
                },
                cancelledInvoices: {
                    $sum: { $cond: [{ $eq: ["$billingStatus", "cancelled"] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalAmount: 1,
                totalPaid: 1,
                totalDue: { $subtract: ["$totalAmount", "$totalPaid"] },
                totalDiscount: 1,
                totalTips: 1,
                totalInvoices: 1,
                averageInvoiceValue: {
                    $cond: {
                        if: { $gt: ["$totalInvoices", 0] },
                        then: { $divide: ["$totalAmount", "$totalInvoices"] },
                        else: 0
                    }
                },
                statusBreakdown: {
                    paid: "$paidInvoices",
                    pending: "$pendingInvoices", 
                    failed: "$failedInvoices",
                    cancelled: "$cancelledInvoices"
                }
            }
        }
    ]);

    const result = summary[0] || {
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        totalDiscount: 0,
        totalTips: 0,
        totalInvoices: 0,
        averageInvoiceValue: 0,
        statusBreakdown: { paid: 0, pending: 0, failed: 0, cancelled: 0 }
    };

    res.status(200).json({
        success: true,
        data: result
    });
});

export { getBills, getInvoiceDetails, getBillingSummary };