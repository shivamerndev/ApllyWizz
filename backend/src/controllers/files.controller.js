import { importJobsFromBuffer } from "../services/import.service.js";
import resumeService from "../services/resume.service.js";
import { PDFParse } from "pdf-parse"
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/error.utils.js";



class FileController {

    
    importJobs = asyncHandler(async (req, res) => {

        let file = req.file;

        if (!file) throw new AppError(400, "Please upload an Excel (.xlsx) file.");

        const summary = await importJobsFromBuffer(file.buffer, file.originalname);

        res.success(200, "Excel spreadsheet imported successfully.", summary);
    });


    tailorResume = asyncHandler(async (req, res) => {
        const jobId = req.body.jobId;

        if (!jobId) throw new AppError(400, "Job ID is required.");
        if (!req.file) throw new AppError(400, "PDF resume file is required.");

        if (req.file.mimetype !== "application/pdf") {
            throw new AppError(400, "Only PDF resume uploads are supported.");
        }

        let resumeText = "";
        try {
            const parser = new PDFParse({ data: req.file.buffer });
            const result = await parser.getText();
            await parser.destroy();
            resumeText = result.text;
        } catch (err) {
            throw new AppError(400, `Failed to parse PDF resume: ${err.message}`);
        }

        if (!resumeText || !resumeText.trim()) {
            throw new AppError(400, "Could not extract text content from the uploaded PDF.");
        }

        const data = await resumeService.tailorResume(resumeText, jobId);
        res.success(200, "Resume tailored successfully.", data);
    });

}


export default new FileController()