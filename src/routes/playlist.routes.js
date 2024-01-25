import { Router } from "express";
import {
    createPlayList,
    addVideoToPlaylist,
    getUserPlaylist,
    getPlaylistwithId,
    updatePlaylist,
    removeVideoFromPlayList,
    deletePlaylist
} from "../controllers/playlist.controller.js"
import { verifyJWt } from "../middlewares/auth.middlewares.js"
const router = Router()

router.route("/createPlaylist").post(verifyJWt, createPlayList)
router.route("/addVideo/:playlistId/:videoId").post(verifyJWt, addVideoToPlaylist)
router.route("/getUserPlaylists/:userId").get(verifyJWt, getUserPlaylist)
router.route("/playlistwihtId/:playlistId").get(verifyJWt, getPlaylistwithId)
router.route("/removeVideo/:playlistId/:videoId").delete(verifyJWt, removeVideoFromPlayList)
router.route("/updatePlaylist/:playlistId").patch(verifyJWt, updatePlaylist)
router.route("/deletePlaylist/:playlistId").delete(verifyJWt, deletePlaylist)
export default router