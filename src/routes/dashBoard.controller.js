import { Router } from "express";
import { getChannelVideo, getChannelStats } from "../controllers/dashBoard.controller.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js"
const router = Router()

router.route("/getVideo").get(verifyJWt, getChannelVideo)
router.route("/getChannelStats").get(verifyJWt, getChannelStats)
export default router