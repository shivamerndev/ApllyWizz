import { connect } from "mongoose";
import { MONGO_URI } from "./env.config.js"

async function connectDB() {

    try {
        await connect(MONGO_URI)
        console.log("Database connected successfully")
    } catch (err) {
        process.exit(1)
        console.log(err.message)
    }
}
export default connectDB;