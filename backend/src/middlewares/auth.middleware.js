import { AppError } from "../utils/error.utils.js";
import { verifyAccessToken } from "../utils/token.utils.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import MongoUserRepository from "../repository/mongo.user.js";

export const userAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) throw new AppError(401, "Not authenticated");

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError(401, "Invalid or expired token");
  }
});
