import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const checkSubscribedOrNot = asyncHandler(async (req, _, next) => {
    let userId = req.user._id
    userId = userId.toString()
    const { channelId } = req.params

    const [subCount] = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId),
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "Total Sub"
        }
    ])
    if (!subCount) {
        req.subCount = 0
    }
    else {
        req.subCount = 1
    }
    next()
})
