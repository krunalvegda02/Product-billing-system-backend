import { Feedback } from "../Models/feedback.model.js";

// =============================
// @desc    Add new feedback
// @route   POST /api/feedback
// @access  Public (or Authenticated if required)
// =============================
const addFeedback = async (req, res) => {
    try {
        const { rating, comment, category, order, table, isPublic } = req.body;

        if (!rating) {
            return res.status(400).json({ message: "Rating is required" });
        }

        const feedback = await Feedback.create({
            user: req.user ? req.user._id : null, // if logged in, else null
            order,
            table,
            rating,
            comment,
            category,
            isPublic,
        });

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback,
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding feedback", error: error.message });
    }
};

// =============================
// @desc    Get all feedback (admin use)
// @route   GET /api/feedback
// @access  Admin
// =============================
const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate("user", "name email") // if user is linked
            .populate("order", "orderNumber totalAmount")
            .populate("table", "tableNumber");

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: "Error fetching feedback", error: error.message });
    }
};

// =============================
// @desc    Get feedback for a specific order/table/user
// @route   GET /api/feedback/:id
// @access  Admin/User
// =============================
const getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
            .populate("user", "name email")
            .populate("order", "orderNumber")
            .populate("table", "tableNumber");

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: "Error fetching feedback", error: error.message });
    }
};



// =============================
// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Admin
// =============================
const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        await feedback.deleteOne();
        res.json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting feedback", error: error.message });
    }
};



export {
    addFeedback,
    getAllFeedback,
    getFeedbackById,
    deleteFeedback,
}