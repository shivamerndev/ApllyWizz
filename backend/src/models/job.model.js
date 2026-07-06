import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleNormalized: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companyNormalized: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    locationNormalized: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    skillsNormalized: {
      type: [String],
      default: [],
    },
    salary: {
      type: String,
      trim: true,
    },
    salaryMin: {
      type: Number,
      index: true,
    },
    salaryMax: {
      type: Number,
      index: true,
    },
    currency: {
      type: String,
      trim: true,
      default: "USD",
    },
    experience: {
      type: String,
      trim: true,
    },
    experienceMin: {
      type: Number,
      index: true,
    },
    experienceMax: {
      type: Number,
      index: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Other"],
      default: "Full-time",
      index: true,
    },
    remote: {
      type: Boolean,
      default: false,
      index: true,
    },
    source: {
      type: String,
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
      index: true,
    },
    duplicateGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      index: true,
      default: null,
    },
    duplicateScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for matching canonical listings quickly within the same company
jobSchema.index({ companyNormalized: 1, titleNormalized: 1 });

// Full text index for robust searching of jobs
jobSchema.index({
  title: "text",
  company: "text",
  description: "text",
  skills: "text",
});

export const Job = mongoose.model("Job", jobSchema);
