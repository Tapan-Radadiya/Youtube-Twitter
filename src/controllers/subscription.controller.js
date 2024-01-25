import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// Subscriber meanse who is logged in or has subsccribed a channel
// Channel meanse subscriber who subscribe other channel

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (req.subCount == 1) throw new ApiError(400, "Already subscribed")

    if (!channelId) throw new ApiError(400, "No channel found")

    const user = await req.user
    if (!user) throw new ApiError(400, "please login")

    const subscription = await Subscription.create({
        subscriber: user?.id,
        channel: channelId
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Subscribed")
        )
})
const getUserChannelSubscriber = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) throw new ApiError(400, "No channel found")
    console.log(new mongoose.Types.ObjectId(channelId));

    const [subCount] = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "Total Subscriber"
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, subCount, "Subscribers fetched")
        )
})
const getSubscribedChannels = asyncHandler(async (req, res) => {

    let user = req.user._id
    user = user.toString()
    const subscriberList = await Subscription.aggregate(
        [
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(user)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "subscribedChannels"
                },
            },
            {
                $addFields: {
                    subscribedChannels: {
                        $first: "$subscribedChannels"
                    }
                }
            },
            {
                $project: {
                    "_id": 0,
                    "subscribedChannels.userName": 1
                }
            }
        ])
    const subList = subscriberList.map(entry => entry.subscribedChannels.userName)
    return res
        .status(200)
        .json(
            new ApiResponse(200, { subList }, "Subscribed channel list fetched successfully")
        )
})
export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels
}
// Done