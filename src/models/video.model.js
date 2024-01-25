import mongoose from "mongoose"
import mongooseAggregarePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = mongoose.Schema({
    videoFile: { // from user
        type: String,
        required: true
    },
    thumbNail: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        // required: true,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregarePaginate)
export const Video = mongoose.model("Video", videoSchema)