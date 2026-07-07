import { connect } from "mongoose";
import { MONGO_URI } from "./env.config.js"
import dns from "dns"

dns.setServers(["8.8.8.8"])

async function connectDB() {

    try {
        await connect(MONGO_URI)
        console.log("Database connected successfully")
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}
export default connectDB;