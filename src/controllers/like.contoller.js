import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { videoId } = req.params

    const checkId = await Video.findById(videoId)
    console.log(checkId?._id);
    if (!checkId) throw new ApiError(404, "No Video Found")

    const checkData = await Like.aggregate(
        [
            {
                $match: {
                    video: new mongoose.Types.ObjectId(checkId),
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            }
        ]
    )

    if (checkData.length == 0) {
        const toggleLike = await Like.create({
            likedBy: userId,
            video: videoId
        })
        await toggleLike.save()
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Video Liked")
            )
    }
    else {
        return res.
            status(400)
            .json(
                new ApiResponse(400, {}, "Video Liked Already")
            )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { commentId } = req.params

    const checkId = await Comment.findById(commentId)
    if (!checkId) throw new ApiError(404, "No Comment Found")

    const checkData = await Like.aggregate(
        [
            {
                $match: {
                    comment: new mongoose.Types.ObjectId(checkId),
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            }
        ]
    )
    if (checkData.length == 0) {
        const toggleLike = await Like.create({
            likedBy: userId,
            comment: commentId
        })
        await toggleLike.save()
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Comment Liked")
            )
    }
    else {
        return res.
            status(400)
            .json(
                new ApiResponse(400, {}, "Comment Liked Already")
            )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { tweetId } = req.params

    const checkId = await Tweet.findById(tweetId)
    if (!checkId) throw new ApiError(404, "No Tweet Found")

    const checkData = await Like.aggregate(
        [
            {
                $match: {
                    tweet: new mongoose.Types.ObjectId(checkId),
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            }
        ]
    )

    if (checkData.length == 0) {
        const toggleLike = await Like.create({
            likedBy: userId,
            tweet: tweetId
        })
        await toggleLike.save()
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Tweet Liked")
            )
    }
    else {
        return res.
            status(400)
            .json(
                new ApiResponse(400, {}, "tweet Liked Already")
            )
    }
})
const allLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const likedVideoList = await Like.aggregate(
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "Data"
                }
            },
            {
                $unwind: "$Data"
            },
            {
                $project: {
                    "Data.videoFile": 1,
                    "Data.thumbNail": 1,
                    "Data.owner": 1,
                    "Data.title": 1,
                    "Data.description": 1,
                    "Data.duration": 1
                }
            }
        ]
    )
    if (!likedVideoList) throw new ApiError(500, "Error fetching your video list")
    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideoList, "Liked video list fetched")
        )
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    allLikedVideos
}