import { jaccardSimilarity } from "../utils/similarity.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.config.js";
import MongoJobRepository from "../repository/mongo.job.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

class ResumeService {

    constructor() {

        this.getPrompt = (job, resumeText) => `You are an expert AI Resume Tailoring Agent. Compare the candidate's resume with the job listing below.
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
        }`;

    }


    /**
     * Resume Tailoring AI Agent matching resume to selected job
     */
    async tailorResume(resumeText, jobId) {

        const details = await MongoJobRepository.findJobById(jobId);
        if (!details || !details.job) throw new Error("Job listing not found.");

        const job = details.job;
        try {

            let prompt = this.getPrompt(job, resumeText)

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

        // Rule-Based NLP Fallback
        return this.tailorResumeFallback(resumeText, job);
    }


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

        return { matchScore, missingSkills, strengths, weaknesses, suggestions };

    }

}

export default new ResumeService()