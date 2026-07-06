import jobService from "../services/job.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/error.utils.js";



class JobController {

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

    const { page, limit } = req.query;

    const filters = { ...req.query, page: page ? parseInt(page, 10) : 1, limit: limit ? parseInt(limit, 10) : 10 };

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

}


export default new JobController();
