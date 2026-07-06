import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { validator } from "../middlewares/validate.middleware.js";
import { signupSchema } from "../validations/auth.validator.js";

const router = Router();

/**
 * @routes /api/v1/auth
 * @description All Authentication Routes
 */

router.post("/register", validator(signupSchema),  authController.register);
router.post("/login", authController.login);
router.get("/user", userAuth, authController.getUser);
router.post("/logout", userAuth, authController.logout);

export default router;