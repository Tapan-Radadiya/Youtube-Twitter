import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";
import { checkSubscribedOrNot } from "../middlewares/checkSubscribed.middlewares.js";

const router = Router()


router.route("/toggleSubscription/:channelId").get(verifyJWt, checkSubscribedOrNot, toggleSubscription)
router.route("/subscriberList/:channelId").get(verifyJWt, getUserChannelSubscriber)
router.route("/subscribedChannels").get(verifyJWt, getSubscribedChannels)
export default router