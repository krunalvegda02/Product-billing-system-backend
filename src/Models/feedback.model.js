import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        // Link feedback to a specific user (optional if anonymous allowed)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },


        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: false,
        },


        // Rating out of 5
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },

        // Optional review message
        comment: {
            type: String,
            trim: true,
            maxlength: 500,
        },

    },
    { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
