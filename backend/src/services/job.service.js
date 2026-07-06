import MongoJobRepository from "../repository/mongo.job.js";

class JobService {

  /**
   * Retrieves dashboard analytics & counters
   */
  async getDashboardStats() {
    const counts = await MongoJobRepository.getDashboardCounts();
    const analytics = await MongoJobRepository.getAnalyticsStats();

    return {
      ...counts,
      ...analytics,
    };
  }


  /**
   * Search and filter jobs
   */
  async getJobs(filters) {
    return await MongoJobRepository.findJobs(filters);
  }


  /**
   * View job details and duplicates info
   */
  async getJobById(id) {
    const details = await MongoJobRepository.findJobById(id);
    if (!details) throw new Error("Job listing not found.");
    return details;
  }


  /**
   * Fetch duplicate groupings
   */
  async getDuplicateGroups() {
    return await MongoJobRepository.findDuplicates();
  }


  /**
   * Resolve duplicate records (confirm/unique)
   */
  async resolveDuplicate(id, action) {
    const details = await MongoJobRepository.findJobById(id);
    if (!details || !details.job) throw new Error("Job listing not found.");

    if (action === "resolve_unique") {
      // Convert duplicate to canonical
      const updated = await MongoJobRepository.updateJob(id, {
        isDuplicate: false,
        duplicateGroupId: null,
        duplicateScore: 0,
      });

      console.log(`Resolved job ID ${id} as UNIQUE`);
      return updated;
    } else if (action === "confirm") {
      // Just log/verify confirmed status (no DB changes needed as it's already marked as duplicate)
      console.log(`Confirmed job ID ${id} as DUPLICATE`);
      return details.job;
    } else {
      throw new Error("Invalid action. Supported: 'confirm', 'resolve_unique'");
    }
  }


}

export default new JobService();
