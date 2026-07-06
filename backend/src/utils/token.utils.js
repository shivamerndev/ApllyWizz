import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/env.config.js"


const generateAccessToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1h" })
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET)
}


export { generateAccessToken, verifyAccessToken }