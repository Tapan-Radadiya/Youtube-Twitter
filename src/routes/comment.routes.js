import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
    getYourComments
} from "../controllers/comment.controller.js"
import { verifyJWt } from "../middlewares/auth.middlewares.js";
const router = Router()


router.route("/videoComment/:videoId").get(verifyJWt, getVideoComments)
router.route("/addComment/:videoId").post(verifyJWt, addComment)
router.route("/updateComment/:commentId").patch(verifyJWt, updateComment)
router.route("/deleteComment/:commentId").delete(verifyJWt, deleteComment)
router.route("/getUserComment").get(verifyJWt, getYourComments)
export default router