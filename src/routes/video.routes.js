import { Router } from "express";
import { verifyJWt } from "../middlewares/auth.middlewares.js";
import { response } from "../middlewares/multer.middleware.js";
import {
    publishVideo,
    getAllVideo,
    deleteVideo,
    videoDetails,
    updateVideo,
    togglePublishStatue,
    watchVideo
} from "../controllers/video.controller.js";

const router = Router()

router.route("/").get(verifyJWt, getAllVideo)
router.route("/upload-video").post(verifyJWt, response.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbNail",
        maxCount: 1
    }
]), publishVideo)
router.route("/v/:videoId").delete(verifyJWt, deleteVideo)
router.route("/v/:videoId").get(verifyJWt, videoDetails)
router.route("/v/:videoId").patch(verifyJWt, response.single("thumbNail"), updateVideo)
router.route("/:videoId").get(verifyJWt, watchVideo)
router.route("/toggle/publish/:videoId").patch(verifyJWt, togglePublishStatue)

export default router 