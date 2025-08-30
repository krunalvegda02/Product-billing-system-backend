import express from "express";
import {
    addFeedback,
    getAllFeedback,
    getFeedbackById,
    deleteFeedback,
} from "../Controllers/feedback.controller.js";
import { API } from "../Constants/endpoints.js";

const feedbackRouter = express.Router();


feedbackRouter.post(API.FEEDBACK.ADD_FEEDBACK, addFeedback);
feedbackRouter.get(API.FEEDBACK.GET_ALL_FEEDBACK, getAllFeedback);
feedbackRouter.get(API.FEEDBACK.GET_FEEDBACK_ID, getFeedbackById);
feedbackRouter.delete(API.FEEDBACK.DELETE_FEEDBACK, deleteFeedback);

export default feedbackRouter;
