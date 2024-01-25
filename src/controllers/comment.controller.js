import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"

import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query

    if (!videoId) throw new ApiError(400, "No Video Found")

    const comments = await Comment.aggregate(
        [
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "userName"
                }
            },
            {
                $addFields: {
                    userName: {
                        $first: "$userName"
                    }
                }
            },
            {
                $project: {
                    content: 1,
                    "userName.userName": 1,
                    "userName.createdAt": 1,
                    "userName.avatar": 1
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: 10
            }
        ]
    )

    if (!comments) throw new ApiError(500, "Eroor fetching comments")

    return res
        .status(200)
        .json(
            new ApiResponse(200, { comments }, "Comments Fetched")
        )
})
const addComment = asyncHandler(async (req, res) => {
    let user = req.user?._id
    user = user.toString()
    const { videoId } = req.params
    if (!videoId) throw new ApiError(400, "No Video Found");

    const videoIdCheck = await Video.findById(videoId)
    if (!videoIdCheck) throw new ApiError(404, "Error loading video")

    const { commentContent } = req.body
    if (!commentContent) throw new ApiError(404, "Please provide data to add comment")

    const comment = await Comment.create([{
        content: commentContent,
        video: videoId,
        owner: user
    }])
    if (!comment) throw new ApiError(400, "Error adding comment try after sometime")

    return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment added successfully")
        )
})
const updateComment = asyncHandler(async (req, res) => {
    const { commentContent } = req.body
    if (!commentContent) throw new ApiError(404, "Please provide data to update comment")

    const { commentId } = req.params
    if (!commentId) throw new ApiError(400, "No comment id found try after some time")

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content: commentContent
        },
    },
        { new: true }).select("-_id -video")

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated ")
        )
})
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) throw new ApiError(400, "Comment not found")

    const data = await Comment.findByIdAndDelete(commentId)
    if (!data)
        throw new ApiError(500, "Error deleting your comment try after sometime")

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Comment Deleted")
        )
})
// added
const getYourComments = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const userComments = await Comment.aggregate(
        [
            {
                $match: {
                    owner: userId
                }
            },
            {
                $project: {
                    content: 1,
                    video: 1
                }
            }
        ]
    )
    if (!userComments) throw new ApiError(500, "Error loading your comments tray after sometime")

    return res
        .status(200)
        .json(
            new ApiResponse(200, userComments, "All comments fetched")
        )
})
export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
    getYourComments
}
