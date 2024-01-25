import { Router } from "express";
import {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
} from "../controllers/tweet.controller.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js"

const router = Router()
router.route("/createTweet").post(verifyJWt, createTweet)
router.route("/getTweets").get(verifyJWt, getUserTweets)
router.route("/updateTweet/:tweetId").patch(verifyJWt, updateTweet)
router.route("/deleteTweet/:tweetId").delete(verifyJWt, deleteTweet)

export default router