import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js"
const router = Router()

router.route("/").get(verifyJWt, healthCheck)
export default router