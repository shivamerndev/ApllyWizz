import authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class AuthController {
    constructor() {
        this.cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 60 * 60 * 1000 // 1 hour
        };
    }

    register = asyncHandler(async (req, res) => {
        let accessToken = await authService.register(req.body);
        res.cookie("token", accessToken, this.cookieOptions);
        res.success(201, "Registered Successfully.");
    });

    login = asyncHandler(async (req, res) => {
        let accessToken = await authService.login(req.body);
        res.cookie("token", accessToken, this.cookieOptions);
        res.success(200, "LoggedIn Successfully.");
    });

    getUser = asyncHandler(async (req, res) => {
        let user = await authService.getUser(req.user.id);
        res.success(200, "User profile retrieved successfully.", user);
    });

    logout = asyncHandler(async (req, res) => {
        res.clearCookie("token", this.cookieOptions);
        res.success(200, "Logged out successfully.");
    });

}

export default new AuthController();