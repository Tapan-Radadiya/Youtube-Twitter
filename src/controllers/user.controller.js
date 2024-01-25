import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadFileCloudinary, removeFileFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import fs from "fs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToekn = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ ValidateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Error Creating Token")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    // Get user Details
    // validation - not empty
    // validation - user already register 
    // images check -- avatar image clodinary
    // multer uploaded -- avatar image
    // create user obj
    // remove pass and token
    // check for user creation
    // ret res

    const { userName, email, fullName, password } = req.body

    if ([userName, email, fullName, password].some((field) => { field?.trim === "" })) { throw new ApiError(400, "All Fields Required") }
    const registerdUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (registerdUser) throw new ApiError(400, "User Already Registered")

    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // If we need only JPG images
    // if (avatarLocalPath.split('.').pop() === "jpg" && coverImageLocalPath.split('.').pop() === "jpg") {
    //     throw new ApiError(400, "Please Provide jpg images only")
    // }
    if (!avatarLocalPath) throw new ApiError(400, "Avatar Image Required")

    const avatar = await uploadFileCloudinary(avatarLocalPath)
    const coverImage = await uploadFileCloudinary(coverImageLocalPath || "")
    fs.unlinkSync(avatarLocalPath)
    if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath)

    if (!avatar) throw new ApiError(400, "Avatar Image Required")
    const user = await User.create({
        userName,
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })
    const userCreated = await User.findOne(user._id).select("-password -refreshToken")
    if (!userCreated) throw new ApiError(500, "Error Registering User Try After Some Time")

    return res.status(200).json(
        new ApiResponse(201, userCreated, "Registration Successfully")
    )
})
const userLogin = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body
    if (!(userName || email)) throw new ApiError(400, "Username Or Email Required")

    const user = await User.findOne({
        $or: [{
            userName, email
        }]
    })
    if (!user) throw new ApiError(401, "User Does not exist")
    const isPassValid = await user.isPasswordCorrect(password)
    if (!isPassValid) throw new ApiError(401, "Password Is Not Valid")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToekn(user._id)
    // console.log("AccessToken---------", accessToken, "RefreshToken---------", refreshToken);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // console.log(loggedInUser);

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        ))
})
const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword, confirmPassword } = req.body
    if (newPassword !== confirmPassword) throw new ApiError(400, "Both Password Should Match")
    const user = await User.findById(req.user?._id);

    const isPassCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPassCorrect) throw new ApiError(400, "Old Password Is Incorrect")

    user.password = newPassword
    await user.save({ ValidateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(201, {}, "Password Is Changed Successfully"))
})
const getCurrentUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (!user) throw new ApiError(400, "Please Login")

    return res
        .status(200)
        .json(
            new ApiResponse(201, user, "User Data")
        )
})
const changeUserDetails = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { new: true })

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Updated Successfully"))
})
const changeAvatar = asyncHandler(async (req, res) => {

    const newAvatarPath = req.file.path
    console.log(newAvatarPath);
    if (!newAvatarPath) throw new ApiError(400, "Please Select avatar image")

    const avatarImage = await uploadFileCloudinary(newAvatarPath)
    if (!avatarImage) throw new ApiError(500, "Error While Uploading Image")

    const user = req.user;
    const oldImageToBeDeleted = user?.avatar

    const updateUser = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatarImage?.url
            }
        },
        {
            new: true
        }).select("-password -refreshToken")

    // removing old image from cloudinary
    await removeFileFromCloudinary(oldImageToBeDeleted)
    // Removing image from local(new img)
    fs.unlinkSync(newAvatarPath)
    return res
        .status(200)
        .json(new ApiResponse(200, updateUser, "Avatar Image Updated"))

})
const updateCoverImage = asyncHandler(async (req, res) => {
    const user = req.user

    const newCoverImage = req.file.path
    if (!newCoverImage) throw new ApiError(404, "Cover image not found")
    const oldCoverImage = user?.coverImage

    const cloudinaryFileUrl = await uploadFileCloudinary(newCoverImage)
    if (!cloudinaryFileUrl) throw new ApiError(500, "Error updating coverimage try after sometime")

    const updateCoverImageStatus = await User.findByIdAndUpdate(user._id,
        {
            coverImage: cloudinaryFileUrl?.url
        }
    )
    if (!updateCoverImageStatus) throw new ApiError(500, "Error updating coverImage try after sometime")
    if (oldCoverImage.length > 0) {
        removeFileFromCloudinary(oldCoverImage)
    }

    fs.unlinkSync(newCoverImage)
    return res
        .status(200)
        .json(
            new ApiResponse(200, { updateCoverImageStatus }, "cover image updated")
        )
})
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params
    if (!userName) throw new ApiError(400, "Username Is Missing")

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        }, {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToChannels: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user_id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                subscribedToChannels: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "Channel Not Exist")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User Channel Fetched ")
        )
})
const getWatchHistory = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const watchHistory = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            userName: 1,
                                            fullName: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )
    if (watchHistory.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Empty watch history")
            )
    }
    else {
        return res
            .status(200)
            .json(
                new ApiResponse(200, { watchHistory }, "Watch history fetched")
            )
    }

})
const generateNewAccessToken = asyncHandler(async (req, res) => {
    try {
        const token = req.cookies?.refreshToken
        if (!token) throw new ApiError(401, "Unauthorized Access")

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) throw new ApiError(400, "Invalid Token")

        if (decodedToken._id !== user._id.toString()) throw new ApiError(401, "Refresh Token Is Expired")

        const { accessToken, refreshToken } = await generateAccessAndRefreshToekn(user._id)
        console.log(accessToken);
        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken }, "AccessToken Refreshed")
            )
    } catch (error) {
        return res
            .status(500)
            .json(
                new ApiError(401, "Error Refreshing Access Token")
            )
    }
})
const userLogout = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1 // remove this field from document
        }
    },
        {
            new: true
        })
    const options = {
        httpOnly: true,
        secure: true
    }
    const userLoggedOut = user?.userName
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, { userLoggedOut }, "User Logged Out"))
})

export {
    registerUser,
    userLogin,
    changeCurrentPassword,
    getCurrentUserDetails,
    changeUserDetails,
    changeAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    generateNewAccessToken,
    userLogout
}