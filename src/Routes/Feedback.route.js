import express from "express";
import {
    addFeedback,
    getAllFeedback,
    getFeedbackById,
    deleteFeedback,
} from "../Controllers/feedback.controller.js";
import { API } from "../Constants/endpoints.js";
import verifyJWT from "../Middlewares/auth.middleware.js";

const feedbackRouter = express.Router();


feedbackRouter.post(API.FEEDBACK.ADD_FEEDBACK, verifyJWT, addFeedback);
feedbackRouter.get(API.FEEDBACK.GET_ALL_FEEDBACK, verifyJWT, getAllFeedback);
feedbackRouter.get(API.FEEDBACK.GET_FEEDBACK_ID, verifyJWT, getFeedbackById);
feedbackRouter.delete(API.FEEDBACK.DELETE_FEEDBACK, verifyJWT, deleteFeedback);

export default feedbackRouter;
