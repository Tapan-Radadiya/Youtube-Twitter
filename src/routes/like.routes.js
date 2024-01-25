import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    allLikedVideos
} from "../controllers/like.contoller.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js"
const router = Router()

router.route("/videoLike/:videoId").post(verifyJWt, toggleVideoLike)
router.route("/commentLike/:commentId").post(verifyJWt, toggleCommentLike)
router.route("/tweetLike/:tweetId").post(verifyJWt, toggleTweetLike)
router.route("/likedVideos").get(verifyJWt, allLikedVideos)
export default router