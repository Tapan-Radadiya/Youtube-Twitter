import cors from "cors"
import cookieParser from "cookie-parser"
import express from "express"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true, limit: "200kb" }))
app.use(express.json({ limit: "200kb" }))
app.use(cookieParser())


// Import Routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import commentRouter from "./routes/comment.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import dashboardRouter from "./routes/dashBoard.controller.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import healthStatusRouter from "./routes/healthCheck.routes.js"
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscription", subscriptionRouter)
app.use("/api/v1/comment", commentRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/like", likeRouter)
app.use("/api/v1/playList", playlistRouter)
app.use("/api/v1/healthStatus", healthStatusRouter)
// http://localhost:8080/api/v1/users/register
export { app }