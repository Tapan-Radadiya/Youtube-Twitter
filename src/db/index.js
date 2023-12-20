import mongoose, { trusted } from "mongoose";
import { DB_NAME } from "../constants.js"

async function connectDB() {
    try {
        const connectionProcess = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(connectionProcess.connection.host);
    } catch (error) {
        console.error("Error : !!", error)
        process.exit(1)
    }
}
export default connectDB