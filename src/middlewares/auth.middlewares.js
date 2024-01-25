import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWt = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken.replace("Bearer ", "")
        if (!token) throw new ApiError(400, "Unauthorized Access")

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) throw new ApiError(401, "Token Is Invalid")

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(400, "Please login or your token has expired" || error?.message)
    }
})
