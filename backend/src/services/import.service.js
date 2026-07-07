import { parseExcelBuffer } from "../utils/xlsx.utils.js";
import { normalizeJobRow } from "../utils/dataNormalizer.js";
import { jaroWinkler, jaccardSimilarity } from "../utils/similarity.js";
import MongoJobRepository from "../repository/mongo.job.js"


/**
 * Imports jobs from an uploaded Excel spreadsheet buffer
 */
export async function importJobsFromBuffer(fileBuffer, originalName) {

    console.log(`Starting excel import: ${originalName}`);

    const { rawRows, sheetName } = parseExcelBuffer(fileBuffer);
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