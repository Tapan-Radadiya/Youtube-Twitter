import mongoose, { trusted } from "mongoose";
import { DB_NAME } from "../constants.js"

async function connectDB() {
    try {

        const connectionProcess = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log("mongodb Connected", connectionProcess.connection.host);
    } catch (error) {
        console.error("MongoDb Connecction Failed : !!", error)
        process.exit(1)
    }
}
export default connectDB