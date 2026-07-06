/**
 * Data Normalizer Utility for Applywizz
 */

/**
 * Standardizes spacing and trims string
 */
export function cleanString(str) {
  if (typeof str !== "string") return "";
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes company name (lowercase, removes suffixes like LLC, Inc., Ltd.)
 */
export function normalizeCompany(company) {
  const clean = cleanString(company)
    .replace(/[^\w\s]/g, "") // remove punctuation first
    .toLowerCase();
  // Remove common company suffixes
  return clean
    .replace(/\b(llc|inc|corp|co|corporation|ltd|gmbh|co\s+ltd|pvt\s+ltd|pvt|limited|sa|ag)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Standardizes location, extracts remote status
 */
export function parseLocationAndRemote(locationRaw) {
  const raw = cleanString(locationRaw);
  if (!raw) {
    return { location: "Not Specified", locationNormalized: "not specified", remote: false };
  }

  const normalized = raw.toLowerCase();
  const remoteKeywords = ["remote", "work from home", "wfh", "telecommute", "anywhere"];
  const isRemote = remoteKeywords.some(keyword => normalized.includes(keyword));

  return {
    location: raw,
    locationNormalized: normalized,
    remote: isRemote,
  };
}

/**
 * Maps messy employment type strings to standard values
 */
export function parseEmploymentType(typeRaw) {
  const raw = cleanString(typeRaw).toLowerCase();
  if (!raw) return "Full-time";

  if (raw.includes("full") || raw.includes("ft") || raw.includes("permanent")) {
    return "Full-time";
  }
  if (raw.includes("part") || raw.includes("pt")) {
    return "Part-time";
  }
  if (raw.includes("contract") || raw.includes("temp") || raw.includes("freelance") || raw.includes("consultant")) {
    return "Contract";
  }
  if (raw.includes("intern") || raw.includes("apprentice")) {
    return "Internship";
  }
  if (raw.includes("temporary")) {
    return "Temporary";
  }

  return "Other";
}

/**
 * Parses experience string to extract min and max years
 */
export function parseExperience(expRaw) {
  const raw = cleanString(expRaw);
  if (!raw) {
    return { experience: "Not Specified", experienceMin: null, experienceMax: null };
  }

  const normalized = raw.toLowerCase();
  let min = null;
  let max = null;

  // Handle formats like "Entry level", "Fresher", "No experience"
  if (normalized.includes("entry") || normalized.includes("fresher") || normalized.includes("no experience") || normalized.includes("0 years")) {
    return { experience: raw, experienceMin: 0, experienceMax: 1 };
  }

  // Handle format "5-10 years" or "3 to 5 yrs"
  const rangeMatch = normalized.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years|yrs|yr|year)?/);
  if (rangeMatch) {
    min = parseInt(rangeMatch[1], 10);
    max = parseInt(rangeMatch[2], 10);
  } else {
    // Handle format "5+ years" or "5+ yrs"
    const plusMatch = normalized.match(/(\d+)\s*\+/);
    if (plusMatch) {
      min = parseInt(plusMatch[1], 10);
      max = null;
    } else {
      // Handle format "up to 5 years"
      const upToMatch = normalized.match(/(?:up to|under|max)\s*(\d+)/);
      if (upToMatch) {
        min = 0;
        max = parseInt(upToMatch[1], 10);
      } else {
        // Just extract the first number found
        const singleNumberMatch = normalized.match(/(\d+)/);
        if (singleNumberMatch) {
          min = parseInt(singleNumberMatch[1], 10);
          max = min;
        }
      }
    }
  }

  return {
    experience: raw,
    experienceMin: min,
    experienceMax: max,
  };
}

/**
 * Parses salary string to extract min, max, and currency
 */
export function parseSalary(salaryRaw) {
  const raw = cleanString(salaryRaw);
  if (!raw) {
    return { salary: "Not Specified", salaryMin: null, salaryMax: null, currency: "USD" };
  }

  const normalized = raw.toUpperCase();
  
  // Extract currency
  let currency = "USD";
  if (normalized.includes("₹") || normalized.includes("INR") || normalized.includes("RS") || normalized.includes("RUPEE")) {
    currency = "INR";
  } else if (normalized.includes("£") || normalized.includes("GBP")) {
    currency = "GBP";
  } else if (normalized.includes("€") || normalized.includes("EUR")) {
    currency = "EUR";
  } else if (normalized.includes("C$") || normalized.includes("CAD")) {
    currency = "CAD";
  } else if (normalized.includes("A$") || normalized.includes("AUD")) {
    currency = "AUD";
  }

  // Clean numbers: convert K to 1000, remove commas, etc.
  const cleanNumberStr = (numStr) => {
    let cleaned = numStr.replace(/,/g, "").trim();
    if (cleaned.endsWith("K")) {
      return parseFloat(cleaned.slice(0, -1)) * 1000;
    }
    return parseFloat(cleaned);
  };

  let min = null;
  let max = null;

  // Regex to match ranges e.g. "80,000 - 120,000" or "80k - 120k" or "$80K - $120K"
  const rangeRegex = /(?:[\$£€₹C\$A\$]\s*)?([\d,]+(?:\.\d+)?\s*[Kk]?)\s*(?:-|TO)\s*(?:[\$£€₹C\$A\$]\s*)?([\d,]+(?:\.\d+)?\s*[Kk]?)/;
  const rangeMatch = normalized.match(rangeRegex);

  if (rangeMatch) {
    min = cleanNumberStr(rangeMatch[1]);
    max = cleanNumberStr(rangeMatch[2]);
  } else {
    // Regex for single number e.g. "100,000" or "80k"
    const singleRegex = /(?:[\$£€₹C\$A\$]\s*)?([\d,]+(?:\.\d+)?\s*[Kk]?)/;
    const singleMatch = normalized.match(singleRegex);
    if (singleMatch) {
      min = cleanNumberStr(singleMatch[1]);
      max = min;
    }
  }

  return {
    salary: raw,
    salaryMin: min,
    salaryMax: max,
    currency,
  };
}

/**
 * Parses skill string to normalized array
 */
export function parseSkills(skillsRaw) {
  if (Array.isArray(skillsRaw)) {
    const cleanSkills = skillsRaw.map(s => cleanString(s)).filter(Boolean);
    return {
      skills: cleanSkills,
      skillsNormalized: cleanSkills.map(s => s.toLowerCase()),
    };
  }

  const raw = cleanString(skillsRaw);
  if (!raw) return { skills: [], skillsNormalized: [] };

  // Split by common delimiters
  const list = raw
    .split(/[,;|/\t]+/)
    .map(s => cleanString(s))
    .filter(Boolean);

  return {
    skills: list,
    skillsNormalized: list.map(s => s.toLowerCase()),
  };
}

/**
 * Parses date string or Excel date value to Javascript Date object
 */
export function parsePostedDate(dateRaw) {
  if (!dateRaw) return new Date();

  // If Excel serial number format for date
  if (typeof dateRaw === "number") {
    // Excel dates start on Jan 1 1900
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const msInDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + dateRaw * msInDay);
  }

  if (dateRaw instanceof Date) return dateRaw;

  const rawStr = cleanString(dateRaw);
  let parsed = new Date(rawStr);

  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Handle relative strings: "x days ago", "yesterday", "today"
  const normalized = rawStr.toLowerCase();
  const now = new Date();

  if (normalized.includes("today")) {
    return now;
  }
  if (normalized.includes("yesterday")) {
    now.setDate(now.getDate() - 1);
    return now;
  }

  const daysAgoMatch = normalized.match(/(\d+)\s+days?\s+ago/);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10);
    now.setDate(now.getDate() - days);
    return now;
  }

  const weeksAgoMatch = normalized.match(/(\d+)\s+weeks?\s+ago/);
  if (weeksAgoMatch) {
    const weeks = parseInt(weeksAgoMatch[1], 10);
    now.setDate(now.getDate() - weeks * 7);
    return now;
  }

  const monthsAgoMatch = normalized.match(/(\d+)\s+months?\s+ago/);
  if (monthsAgoMatch) {
    const months = parseInt(monthsAgoMatch[1], 10);
    now.setMonth(now.getMonth() - months);
    return now;
  }

  return new Date(); // default fallback
}

/**
 * Full row normalization engine
 */
export function normalizeJobRow(row) {
  const title = cleanString(row.title || row.jobTitle || row.Title);
  const company = cleanString(row.company || row.companyName || row.Company);
  
  if (!title || !company) {
    throw new Error("Missing required fields: Title and Company are required.");
  }

  const { location, locationNormalized, remote } = parseLocationAndRemote(row.location || row.Location);
  const { skills, skillsNormalized } = parseSkills(row.skills || row.Skills || row.keySkills || row.skillsRequired);
  const { salary, salaryMin, salaryMax, currency } = parseSalary(row.salary || row.Salary || row.compensation);
  const { experience, experienceMin, experienceMax } = parseExperience(row.experience || row.Experience || row.expRequired);
  const employmentType = parseEmploymentType(row.employmentType || row.jobType || row.EmploymentType);
  const postedDate = parsePostedDate(row.postedDate || row.posted || row.PostedDate || row.datePosted);

  return {
    title,
    titleNormalized: title.toLowerCase(),
    company,
    companyNormalized: normalizeCompany(company),
    location,
    locationNormalized,
    remote,
    description: cleanString(row.description || row.jobDescription || row.Description || "No description provided."),
    skills,
    skillsNormalized,
    salary,
    salaryMin,
    salaryMax,
    currency,
    experience,
    experienceMin,
    experienceMax,
    employmentType,
    postedDate,
    source: cleanString(row.source || row.Source || "Imported Spreadsheet"),
    sourceUrl: cleanString(row.sourceUrl || row.applyUrl || row.SourceUrl || ""),
    department: cleanString(row.department || row.Department || "General"),
  };
}
