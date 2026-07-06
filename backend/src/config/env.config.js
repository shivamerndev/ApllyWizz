import "dotenv/config"
import { AppError } from "../utils/error.utils.js"

export const {
  PORT,
  MONGO_URI,
  NODE_ENV,
  JWT_SECRET,
  CLIENT_URL,
  GEMINI_API_KEY
} = process.env

const checkVariables = {
  PORT,
  MONGO_URI,
  NODE_ENV,
  JWT_SECRET,
  CLIENT_URL,
  GEMINI_API_KEY
}

Object.entries(checkVariables).forEach(([key, value]) => {
  if (!value) {
    console.log(`Missing Environment Variable: ${key}`)
    throw new AppError(400, `Missing Environment Variable : ${key}`)
  }
})