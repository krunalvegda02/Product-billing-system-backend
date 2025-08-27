import mongoose from "mongoose";

const DashboardSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now, // store week date (you can save start of week)
  },

  revenue: {
    current: { type: Number, required: true },
    previous: { type: Number, required: true },
    trend: { type: String, enum: ["up", "down"], required: true }
  },

  customers: {
    current: { type: Number, required: true },
    previous: { type: Number, required: true },
    trend: { type: String, enum: ["up", "down"], required: true }
  },

  orders: {
    current: { type: Number, required: true },
    previous: { type: Number, required: true },
    trend: { type: String, enum: ["up", "down"], required: true }
  },

  avgOrderValue: {
    current: { type: Number, required: true },
    previous: { type: Number, required: true },
    trend: { type: String, enum: ["up", "down"], required: true }
  },

  menuItems: {
    total: { type: Number, required: true },
    popular: { type: Number, required: true }
  },

  topCategories: [
    {
      name: { type: String, required: true },
      value: { type: Number, required: true }, // percentage
      color: { type: String, required: true }
    }
  ],

  tables: {
    available: { type: Number, required: true },
    occupied: { type: Number, required: true },
    total: { type: Number, required: true }
  },

  recentOrders: [
    {
      customer: { type: String, required: true },
      items: { type: Number, required: true },
      total: { type: Number, required: true },
      status: { type: String, enum: ["served", "preparing", "pending"], required: true },
      time: { type: String, required: true } // e.g. "10 min ago"
    }
  ],

  reviews: [
    {
      customer: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, required: true },
      date: { type: Date, required: true }
    }
  ]
}, { timestamps: true }); // adds createdAt & updatedAt

const DashboardModel = mongoose.model("Dashboard", DashboardSchema);
export default DashboardModel;
