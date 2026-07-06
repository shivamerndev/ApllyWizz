import jobService from "../services/job.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/error.utils.js";

class JobController {
  /**
   * Import jobs from Excel sheet
   */
  importJobs = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError(400, "Please upload an Excel (.xlsx) file.");
    }
    
    const summary = await jobService.importJobsFromBuffer(req.file.buffer, req.file.originalname);
    res.success(200, "Excel spreadsheet imported successfully.", summary);
  });

  /**
   * Fetch dashboard counts & analytics
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await jobService.getDashboardStats();
    res.success(200, "Dashboard statistics retrieved successfully.", stats);
  });

  /**
   * Retrieve job listings with pagination & filter parameters
   */
  getJobs = asyncHandler(async (req, res) => {
    const {
      search,
      company,
      location,
      employmentType,
      remote,
      experience,
      salaryMin,
      salaryMax,
      isDuplicate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const filters = {
      search,
      company,
      location,
      employmentType,
      remote,
      experience,
      salaryMin,
      salaryMax,
      isDuplicate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy,
      sortOrder,
    };

    const data = await jobService.getJobs(filters);
    res.success(200, "Job listings retrieved successfully.", data);
  });

  /**
   * Fetch single job detail
   */
  getJobById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Job ID is required.");

    const data = await jobService.getJobById(id);
    res.success(200, "Job details retrieved successfully.", data);
  });

  /**
   * Get duplicate job groupings
   */
  getDuplicates = asyncHandler(async (req, res) => {
    const data = await jobService.getDuplicateGroups();
    res.success(200, "Duplicate listings retrieved successfully.", data);
  });

  /**
   * Resolve duplicate status
   */
  resolveDuplicate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    if (!id) throw new AppError(400, "Job ID is required.");
    if (!action) throw new AppError(400, "Resolution action is required.");

    const data = await jobService.resolveDuplicate(id, action);
    res.success(200, "Duplicate record status updated successfully.", data);
  });

  /**
   * Resume Tailoring AI Agent matching
   */
  tailorResume = asyncHandler(async (req, res) => {
    const { resumeText, jobId } = req.body;

    if (!resumeText) throw new AppError(400, "Resume text is required.");
    if (!jobId) throw new AppError(400, "Job ID is required.");

    const data = await jobService.tailorResume(resumeText, jobId);
    res.success(200, "Resume tailored successfully.", data);
  });
}

export default new JobController();
