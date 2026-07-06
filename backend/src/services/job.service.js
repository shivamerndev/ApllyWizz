import xlsx from "xlsx";
import MongoJobRepository from "../repository/mongo.job.js";
import { normalizeJobRow } from "../utils/dataNormalizer.js";
import { jaroWinkler, jaccardSimilarity } from "../utils/similarity.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

class JobService {
  /**
   * Imports jobs from an uploaded Excel spreadsheet buffer
   */
  async importJobsFromBuffer(fileBuffer, originalName) {
    console.log(`Starting excel import: ${originalName}`);
    
    let workbook;
    try {
      workbook = xlsx.read(fileBuffer, { type: "buffer" });
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("Excel file contains no sheets.");

    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(`Found ${rawRows.length} rows in sheet "${sheetName}"`);

    const summary = {
      totalRows: rawRows.length,
      imported: 0,
      updated: 0,
      failed: 0,
      duplicatesFound: 0,
    };

    // Cache to check intra-batch unique jobs quickly
    const batchCanonicalCache = {};

    for (let index = 0; index < rawRows.length; index++) {
      const rawRow = rawRows[index];
      try {
        // 1. Data Normalization
        const normalized = normalizeJobRow(rawRow);

        // 2. Duplicate Detection
        // Query candidates under the same company from the DB
        const dbCandidates = await MongoJobRepository.findCanonicalCandidatesByCompany(normalized.companyNormalized);
        
        // Also get candidates from current batch cache
        const cacheCandidates = batchCanonicalCache[normalized.companyNormalized] || [];
        const allCandidates = [...dbCandidates, ...cacheCandidates];

        let bestMatch = null;
        let highestScore = 0;

        for (const candidate of allCandidates) {
          // Similarity calculations
          const titleScore = jaroWinkler(normalized.titleNormalized, candidate.titleNormalized);
          const descScore = jaccardSimilarity(normalized.description, candidate.description);
          
          // Calculate skill overlap similarity
          const candidateSkillsStr = candidate.skillsNormalized.join(" ");
          const normalizedSkillsStr = normalized.skillsNormalized.join(" ");
          const skillsScore = jaccardSimilarity(normalizedSkillsStr, candidateSkillsStr);

          // Combined score weighted: 50% title, 30% description, 20% skills
          const combinedScore = (0.5 * titleScore) + (0.3 * descScore) + (0.2 * skillsScore);

          if (combinedScore > highestScore) {
            highestScore = combinedScore;
            bestMatch = candidate;
          }
        }

        // Duplicate threshold (e.g. 82%)
        const DUPLICATE_THRESHOLD = 0.82;

        if (bestMatch && highestScore >= DUPLICATE_THRESHOLD) {
          normalized.isDuplicate = true;
          normalized.duplicateGroupId = bestMatch._id;
          normalized.duplicateScore = parseFloat(highestScore.toFixed(3));
          summary.duplicatesFound++;
        }

        // Save row to database immediately so it is available for subsequent rows
        const saved = await MongoJobRepository.createJob(normalized);

        // If it's a new canonical job, cache it for the remainder of this batch
        if (!normalized.isDuplicate) {
          if (!batchCanonicalCache[normalized.companyNormalized]) {
            batchCanonicalCache[normalized.companyNormalized] = [];
          }
          batchCanonicalCache[normalized.companyNormalized].push(saved);
        }

        summary.imported++;
      } catch (error) {
        console.log(`Import failed at row ${index + 2}: ${error.message}`);
        summary.failed++;
      }
    }

    console.log(`Import complete: ${JSON.stringify(summary)}`);
    return summary;
  }

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

  /**
   * Resume Tailoring AI Agent matching resume to selected job
   */
  async tailorResume(resumeText, jobId) {
    const details = await MongoJobRepository.findJobById(jobId);
    if (!details || !details.job) throw new Error("Job listing not found.");

    const job = details.job;

    // Check Gemini API key in env
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an expert AI Resume Tailoring Agent. Compare the candidate's resume with the job listing below.
Analyze skill alignment, experience alignment, strengths, weaknesses, and provide recommendations.

Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description}
Job Required Skills: ${job.skills.join(", ")}

Candidate Resume:
${resumeText}

You MUST return a JSON object with this exact format (no markdown code fence blocks, just the raw JSON string):
{
  "matchScore": 85, // Integer score between 0 and 100
  "missingSkills": ["React Native", "Swift"], // Skills from job not found in resume
  "strengths": ["Strong backend experience in Node.js", "Solid MongoDB schema knowledge"], // Match strengths
  "weaknesses": ["Lack of mobile development projects", "No mention of CI/CD pipelines"], // Gaps or areas of concern
  "suggestions": ["Add a section highlighting React Native projects", "Specify CI/CD experience with GitHub Actions"] // Resume improvements
}
`;

        const response = await model.generateContent(prompt);
        let resultText = response.response.text();
        
        // Strip markdown code fences if outputted
        if (resultText.startsWith("```")) {
          resultText = resultText.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
        }
        resultText = resultText.trim();

        const json = JSON.parse(resultText);
        return json;

      } catch (error) {
        console.log(`Gemini API tailoring failed: ${error.message}. Falling back to Rule-based NLP matching.`);
      }
    }

    // Rule-Based NLP Fallback
    return this.tailorResumeFallback(resumeText, job);
  }

  /**
   * Fallback rule-based resume matching (Regex token matcher)
   */
  tailorResumeFallback(resumeText, job) {
    const resumeLower = resumeText.toLowerCase();
    const jobSkills = job.skills.map(s => s.trim()).filter(Boolean);

    const missingSkills = [];
    const matchedSkills = [];

    jobSkills.forEach(skill => {
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
      if (regex.test(resumeLower)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Score calculation based on skill matches
    let matchScore = 0;
    if (jobSkills.length > 0) {
      matchScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
    } else {
      // Fallback Jaccard on overall text
      const jaccard = jaccardSimilarity(resumeLower, job.description.toLowerCase());
      matchScore = Math.round(jaccard * 100);
    }

    // Construct strengths and suggestions
    const strengths = matchedSkills.length > 0 
      ? [`Matched core skills: ${matchedSkills.slice(0, 3).join(", ")}`]
      : ["Resume parsed, but core skills alignment is low."];

    const weaknesses = missingSkills.length > 0
      ? [`Missing skills: ${missingSkills.slice(0, 3).join(", ")}`]
      : ["No obvious missing technical skills."];

    const suggestions = [];
    if (missingSkills.length > 0) {
      suggestions.push(`Consider adding these missing technical skills if you possess them: ${missingSkills.join(", ")}.`);
    }
    suggestions.push("Ensure your professional summary highlights your experience with similar tech stack.");
    suggestions.push(`Quantify your accomplishments under similar roles matching "${job.title}".`);

    return {
      matchScore,
      missingSkills,
      strengths,
      weaknesses,
      suggestions,
    };
  }
}

export default new JobService();
