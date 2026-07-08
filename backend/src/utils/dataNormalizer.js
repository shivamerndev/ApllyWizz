export function cleanString(str) {
  return typeof str === "string" ? str.replace(/\s+/g, " ").trim() : "";
}

export function normalizeCompany(company) {
  return cleanString(company)
    .replace(/[^\w\s]/g, "")
    .toLowerCase()
    .replace(/\b(llc|inc|corp|co|corporation|ltd|gmbh|co\s+ltd|pvt\s+ltd|pvt|limited|sa|ag)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseLocationAndRemote(locationRaw) {
  const raw = cleanString(locationRaw);
  if (!raw) return { location: "Not Specified", locationNormalized: "not specified", remote: false };
  const normalized = raw.toLowerCase();
  return {
    location: raw,
    locationNormalized: normalized,
    remote: /remote|work from home|wfh|telecommute|anywhere/.test(normalized),
  };
}

export function parseEmploymentType(typeRaw) {
  const raw = cleanString(typeRaw).toLowerCase();
  if (!raw) return "Full-time";
  if (/full|ft|permanent/.test(raw)) return "Full-time";
  if (/part|pt/.test(raw)) return "Part-time";
  if (/contract|temp|freelance|consultant/.test(raw)) return "Contract";
  if (/intern|apprentice/.test(raw)) return "Internship";
  return raw.includes("temporary") ? "Temporary" : "Other";
}

export function parseExperience(expRaw) {
  const raw = cleanString(expRaw);
  if (!raw) return { experience: "Not Specified", experienceMin: null, experienceMax: null };

  const norm = raw.toLowerCase();
  if (/entry|fresher|no experience|0 years/.test(norm)) {
    return { experience: raw, experienceMin: 0, experienceMax: 1 };
  }

  let min = null, max = null, match;
  if ((match = norm.match(/(\d+)\s*(?:-|to)\s*(\d+)/))) {
    min = parseInt(match[1], 10);
    max = parseInt(match[2], 10);
  } else if ((match = norm.match(/(\d+)\s*\+/))) {
    min = parseInt(match[1], 10);
  } else if ((match = norm.match(/(?:up to|under|max)\s*(\d+)/))) {
    min = 0;
    max = parseInt(match[1], 10);
  } else if ((match = norm.match(/(\d+)/))) {
    min = max = parseInt(match[1], 10);
  }

  return { experience: raw, experienceMin: min, experienceMax: max };
}

export function parseSalary(salaryRaw) {
  const raw = cleanString(salaryRaw);
  if (!raw) return { salary: "Not Specified", salaryMin: null, salaryMax: null, currency: "USD" };

  const norm = raw.toUpperCase();
  const currency = /₹|INR|RS|RUPEE/.test(norm) ? "INR"
    : /£|GBP/.test(norm) ? "GBP"
      : /€|EUR/.test(norm) ? "EUR"
        : /C\$|CAD/.test(norm) ? "CAD"
          : /A\$|AUD/.test(norm) ? "AUD"
            : "USD";

  const cleanNum = (str) => {
    const clean = str.replace(/,/g, "").trim();
    return parseFloat(clean) * (clean.endsWith("K") ? 1000 : 1);
  };

  let min = null, max = null;
  const rangeMatch = norm.match(/(?:[\$£€₹C\$A\$]\s*)?([\d,]+(?:\.\d+)?\s*K?)\s*(?:-|TO)\s*(?:[\$£€₹C\$A\$]\s*)?([\d,]+(?:\.\d+)?\s*K?)/);

  if (rangeMatch) {
    min = cleanNum(rangeMatch[1]);
    max = cleanNum(rangeMatch[2]);
  } else {
    const singleMatch = norm.match(/(?:[\$£€₹C\$A\$]\s*)?([\d,]+(?:\.\d+)?\s*K?)/);
    if (singleMatch) min = max = cleanNum(singleMatch[1]);
  }

  return { salary: raw, salaryMin: min, salaryMax: max, currency };
}

export function parseSkills(skillsRaw) {
  let list = [];
  if (Array.isArray(skillsRaw)) {
    list = skillsRaw.map(s => cleanString(s)).filter(Boolean);
  } else {
    const raw = cleanString(skillsRaw);
    if (raw) list = raw.split(/[,;|/\t]+/).map(s => cleanString(s)).filter(Boolean);
  }
  return { skills: list, skillsNormalized: list.map(s => s.toLowerCase()) };
}

export function parsePostedDate(dateRaw) {
  if (!dateRaw) return new Date();
  if (typeof dateRaw === "number") return new Date(Date.UTC(1899, 11, 30) + dateRaw * 86400000);
  if (dateRaw instanceof Date) return dateRaw;

  const rawStr = cleanString(dateRaw);
  const parsed = new Date(rawStr);
  if (!isNaN(parsed.getTime())) return parsed;

  const norm = rawStr.toLowerCase();
  const now = new Date();
  if (norm.includes("today")) return now;
  if (norm.includes("yesterday")) {
    now.setDate(now.getDate() - 1);
    return now;
  }

  let match;
  if ((match = norm.match(/(\d+)\s+days?\s+ago/))) {
    now.setDate(now.getDate() - parseInt(match[1], 10));
  } else if ((match = norm.match(/(\d+)\s+weeks?\s+ago/))) {
    now.setDate(now.getDate() - parseInt(match[1], 10) * 7);
  } else if ((match = norm.match(/(\d+)\s+months?\s+ago/))) {
    now.setMonth(now.getMonth() - parseInt(match[1], 10));
  } else {
    return new Date();
  }
  return now;
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

  return {
    title,
    titleNormalized: title.toLowerCase(),
    company,
    companyNormalized: normalizeCompany(company),
    ...parseLocationAndRemote(row.location || row.Location),
    description: cleanString(row.description || row.jobDescription || row.Description || "No description provided."),
    ...parseSkills(row.skills || row.Skills || row.keySkills || row.skillsRequired),
    ...parseSalary(row.salary || row.Salary || row.compensation),
    ...parseExperience(row.experience || row.Experience || row.expRequired),
    employmentType: parseEmploymentType(row.employmentType || row.jobType || row.EmploymentType),
    postedDate: parsePostedDate(row.postedDate || row.posted || row.PostedDate || row.datePosted),
    source: cleanString(row.source || row.Source || "Imported Spreadsheet"),
    sourceUrl: cleanString(row.sourceUrl || row.applyUrl || row.SourceUrl || ""),
    department: cleanString(row.department || row.Department || "General"),
  };
}

