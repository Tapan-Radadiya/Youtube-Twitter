import { Router } from "express";
import {
    registerUser,
    userLogout,
    userLogin,
    generateNewAccessToken,
    changeCurrentPassword,
    getCurrentUserDetails,
    getUserChannelProfile,
    updateCoverImage,
    getWatchHistory,
    changeUserDetails,
    changeAvatar
} from "../controllers/user.controller.js";
import { response } from "../middlewares/multer.middleware.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js"
const router = Router()

router.route("/register").post(response.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)
router.route("/login").post(userLogin)
router.route("/changePass").post(verifyJWt, changeCurrentPassword)
router.route("/updateUser").patch(verifyJWt, changeUserDetails)
router.route("/avatarUpdate").patch(verifyJWt, response.single("avatar"), changeAvatar)
// Secured Routes
router.route("/get-user").post(verifyJWt, getCurrentUserDetails)
router.route("/c/:userName").get(verifyJWt, getUserChannelProfile)
router.route("/logout").post(verifyJWt, userLogout)
router.route("/refresh-Token").post(generateNewAccessToken)
router.route("/watchHistory").get(verifyJWt, getWatchHistory)
router.route("/updateCoverImage").patch(verifyJWt, response.single("coverImage"), updateCoverImage)

export default router