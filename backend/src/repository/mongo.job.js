import { Job } from "../models/job.model.js";

class MongoJobRepository {


  async createJob(jobData) {
    const job = new Job(jobData);
    return await job.save();
  }

  /**
   * Bulk writes operations to MongoDB for high performance
   */
  async bulkWriteJobs(operations) {
    if (!operations || operations.length === 0) return { insertedCount: 0, modifiedCount: 0 };
    return await Job.bulkWrite(operations);
  }


  async findJobs({ search, company, location, employmentType, remote, experience, salaryMin, salaryMax, isDuplicate, page = 1, limit = 10, sortBy = "postedDate", sortOrder = "desc" }) {
    const query = {};

    // Filter duplicate status
    if (typeof isDuplicate === "boolean") {
      query.isDuplicate = isDuplicate;
    } else if (isDuplicate === "true" || isDuplicate === "false") {
      query.isDuplicate = isDuplicate === "true";
    }

    // Full text or partial search
    if (search) {
      const cleanSearch = search.trim();
      query.$or = [
        { title: { $regex: cleanSearch, $options: "i" } },
        { company: { $regex: cleanSearch, $options: "i" } },
        { description: { $regex: cleanSearch, $options: "i" } },
        { skills: { $regex: cleanSearch, $options: "i" } },
      ];
    }

    // Direct filters
    if (company) {
      query.companyNormalized = company.toLowerCase().trim();
    }
    if (location) {
      query.locationNormalized = { $regex: location.toLowerCase().trim(), $options: "i" };
    }
    if (employmentType) {
      query.employmentType = employmentType;
    }
    if (typeof remote === "boolean") {
      query.remote = remote;
    } else if (remote === "true" || remote === "false") {
      query.remote = remote === "true";
    }

    // Experience filter (checking overlapping range or min experience)
    if (experience) {
      const expNum = parseInt(experience, 10);
      if (!isNaN(expNum)) {
        query.$or = [
          { experienceMin: { $lte: expNum }, experienceMax: { $gte: expNum } },
          { experienceMin: { $lte: expNum }, experienceMax: null },
          { experienceMin: null, experienceMax: null }
        ];
      }
    }

    // Salary filters
    if (salaryMin !== undefined && salaryMin !== null && salaryMin !== "") {
      const minVal = parseFloat(salaryMin);
      if (!isNaN(minVal)) {
        query.salaryMax = { $gte: minVal };
      }
    }
    if (salaryMax !== undefined && salaryMax !== null && salaryMax !== "") {
      const maxVal = parseFloat(salaryMax);
      if (!isNaN(maxVal)) {
        query.salaryMin = { $lte: maxVal };
      }
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sort.postedDate = -1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sort).skip(skip).limit(limit).exec(),
      Job.countDocuments(query).exec(),
    ]);

    return {
      jobs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }


  async findJobById(id) {
    const job = await Job.findById(id).exec();
    if (!job) return null;

    let duplicates = [];
    let canonical = null;

    if (job.isDuplicate) {
      // Find the main canonical job
      canonical = await Job.findById(job.duplicateGroupId).exec();
    } else {
      // If it's a canonical job, find all of its duplicates
      duplicates = await Job.find({ duplicateGroupId: job._id }).exec();
    }

    return {
      job,
      duplicates,
      canonical,
    };
  }


  async findDuplicates() {
    return await Job.aggregate([
      { $match: { isDuplicate: true } },
      {
        $group: {
          _id: "$duplicateGroupId",
          duplicates: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "jobs", // Mongoose collection name is "jobs"
          localField: "_id",
          foreignField: "_id",
          as: "canonical",
        },
      },
      { $unwind: "$canonical" },
      { $sort: { "canonical.createdAt": -1 } },
    ]);
  }


  async updateJob(id, updates) {
    return await Job.findByIdAndUpdate(id, updates, { new: true }).exec();
  }


  async findCanonicalCandidatesByCompany(companyNormalized) {
    return await Job.find({ companyNormalized, isDuplicate: false }).exec();
  }


  async getDashboardCounts() {
    const stats = await Job.aggregate([{
      $facet: {
        totalJobs: [{ $count: "count" }],
        duplicateJobs: [{ $match: { isDuplicate: true } }, { $count: "count" }],
        remoteJobs: [{ $match: { remote: true } }, { $count: "count" }],
        companies: [{ $group: { _id: "$companyNormalized" } }, { $count: "count" }],
        locations: [{ $group: { _id: "$locationNormalized" } }, { $count: "count" }],
      },
    }]);

    const getValue = (facetResult) => facetResult[0]?.count || 0;

    return {
      totalJobs: getValue(stats[0].totalJobs),
      duplicateJobs: getValue(stats[0].duplicateJobs),
      remoteJobs: getValue(stats[0].remoteJobs),
      totalCompanies: getValue(stats[0].companies),
      totalLocations: getValue(stats[0].locations),
    };
  }


  async getAnalyticsStats() {
    // 1. Employment Type Distribution
    const empTypeDist = await Job.aggregate([{ $group: { _id: "$employmentType", count: { $sum: 1 } } }]);

    // 2. Top Hiring Companies (Canonical only, to prevent duplicate inflate)
    const topCompanies = await Job.aggregate([
      { $match: { isDuplicate: false } },
      { $group: { _id: "$company", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    // 3. Salary distribution by currency
    const salaryRanges = await Job.aggregate([
      { $match: { salaryMin: { $ne: null } } },
      {
        $group: {
          _id: "$currency",
          avgMinSalary: { $avg: "$salaryMin" },
          avgMaxSalary: { $avg: "$salaryMax" },
          minSalary: { $min: "$salaryMin" },
          maxSalary: { $max: "$salaryMax" },
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Skills Frequency
    const skillsFreq = await Job.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: { $toLower: { $trim: { input: "$skills" } } }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    // 5. Recent jobs
    const recentJobs = await Job.find({ isDuplicate: false })
      .sort({ postedDate: -1 })
      .limit(5)
      .exec();

    // Formatting distribution mapping
    const employmentTypeDistribution = {};
    empTypeDist.forEach(item => {
      employmentTypeDistribution[item._id] = item.count;
    });


    return { employmentTypeDistribution, topCompanies, salaryRanges, skillsFreq, recentJobs };

  }
}

export default new MongoJobRepository();