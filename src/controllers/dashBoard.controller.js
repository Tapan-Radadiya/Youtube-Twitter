import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js"
import mongoose from "mongoose";


const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    // Count subs
    const [countSubs] = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $count: 'Total_subscribers'
            }
        ]
    )
    // Total videos
    const [totalVideos] = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $count: 'Total_Videos'
            }
        ]
    )
    // Total video views
    const totalVideoViews = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project: {
                    _id: 0,
                    owner: 0
                }
            }
        ]
    )
    // Total likes per video
    const totalLikes = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likedVideos"
                }
            },
            {
                $project: {
                    videoFile: 1,
                    thumbNail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    totalLikes: {
                        $size: "$likedVideos"
                    }
                }
            }
        ]
    )
    if (totalLikes.length === 0) throw new ApiError(404, "There is no likes on video, keep creating")
    if (totalVideos.length === 0) throw new ApiError(404, "There is no video please upload")
    if (totalVideoViews.length === 0) throw new ApiError(404, "No video found on your site")
    return res
        .status(200)
        .json(
            new ApiResponse(200, [countSubs, totalVideos, totalVideoViews, totalLikes], "Dashboard Data")
        )
})
const getChannelVideo = asyncHandler(async (req, res) => {
    const user = req.user?._id
    console.log(user);
    const videoList = await Video.aggregate([{
        $match: {
            owner: user
        }
    }])
    if (!videoList) throw new ApiError(500, "Error fetching videos ")
    return res
        .status(200)
        .json(
            new ApiResponse(200, { videoList, totalVideos }, "Videos fetched")
        )
})

export {
    getChannelVideo,
    getChannelStats
}