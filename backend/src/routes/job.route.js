import { Router } from "express";
import multer from "multer";
import jobController from "../controllers/job.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Protect all job and dashboard routes
router.use(userAuth);

// Jobs CRUD & Import
router.post("/jobs/import", upload.single("file"), jobController.importJobs);
router.get("/jobs", jobController.getJobs);
router.get("/jobs/:id", jobController.getJobById);

// Duplicates Manager
router.get("/duplicates", jobController.getDuplicates);
router.patch("/duplicates/:id", jobController.resolveDuplicate);

// Dashboard & Analytics metrics
router.get("/dashboard", jobController.getDashboardStats);
router.get("/analytics", jobController.getDashboardStats);

// AI Resume Tailor
router.post("/resume/tailor", jobController.tailorResume);

export default router;
