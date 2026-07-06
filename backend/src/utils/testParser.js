import {
  normalizeCompany, parseLocationAndRemote, parseEmploymentType, parseExperience, parseSalary, parseSkills, parsePostedDate} from "./dataNormalizer.js";
import { jaroWinkler, jaccardSimilarity } from "./similarity.js";


// Helper assertions
const assertEqual = (actual, expected, testName) => {

  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);

  if (actualStr === expectedStr) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}\n   Expected: ${expectedStr}\n   Actual:   ${actualStr}`);
  }
};

const assertNear = (actual, expected, precision = 0.01, testName) => {
  if (Math.abs(actual - expected) <= precision) {
    console.log(`✅ PASS: ${testName} (${actual.toFixed(3)} matches expected ${expected.toFixed(3)})`);
  } else {
    console.error(`❌ FAIL: ${testName}\n   Expected near: ${expected}\n   Actual:        ${actual}`);
  }
};

console.log("=== STARTING NORMALIZATION ENGINE TEST SUITE ===\n");

// 1. Company Normalization
assertEqual(normalizeCompany("Google LLC"), "google", "Company: Strip LLC");
assertEqual(normalizeCompany("Microsoft Corporation"), "microsoft", "Company: Strip Corporation");
assertEqual(normalizeCompany("Applywizz Pvt. Ltd."), "applywizz", "Company: Strip Pvt Ltd");

// 2. Location & Remote
assertEqual(
  parseLocationAndRemote("New York, NY"),
  { location: "New York, NY", locationNormalized: "new york, ny", remote: false },
  "Location: standard city"
);
assertEqual(
  parseLocationAndRemote("San Francisco (Remote)"),
  { location: "San Francisco (Remote)", locationNormalized: "san francisco (remote)", remote: true },
  "Location: city with remote keyword"
);

// 3. Employment Type mapping
assertEqual(parseEmploymentType("Full-time"), "Full-time", "JobType: Full-time");
assertEqual(parseEmploymentType("FT"), "Full-time", "JobType: FT abbreviation");
assertEqual(parseEmploymentType("contractor"), "Contract", "JobType: contractor mappings");
assertEqual(parseEmploymentType("internship"), "Internship", "JobType: internship mappings");

// 4. Experience parsing
assertEqual(
  parseExperience("3-5 years"),
  { experience: "3-5 years", experienceMin: 3, experienceMax: 5 },
  "Experience: Range 3-5 years"
);
assertEqual(
  parseExperience("5+ yrs"),
  { experience: "5+ yrs", experienceMin: 5, experienceMax: null },
  "Experience: Open-ended 5+ yrs"
);
assertEqual(
  parseExperience("Entry level"),
  { experience: "Entry level", experienceMin: 0, experienceMax: 1 },
  "Experience: Entry Level text"
);

// 5. Salary range extraction
assertEqual(
  parseSalary("$80,000 - $120,000"),
  { salary: "$80,000 - $120,000", salaryMin: 80000, salaryMax: 120000, currency: "USD" },
  "Salary: USD range with commas"
);
assertEqual(
  parseSalary("80k - 100k"),
  { salary: "80k - 100k", salaryMin: 80000, salaryMax: 100000, currency: "USD" },
  "Salary: k multiplier range"
);
assertEqual(
  parseSalary("₹12,00,000 INR"),
  { salary: "₹12,00,000 INR", salaryMin: 1200000, salaryMax: 1200000, currency: "INR" },
  "Salary: Indian Rupee parse"
);

// 6. Skills splitting
assertEqual(
  parseSkills("React, Node.js; MongoDB | HTML"),
  {
    skills: ["React", "Node.js", "MongoDB", "HTML"],
    skillsNormalized: ["react", "node.js", "mongodb", "html"],
  },
  "Skills: Diverse delimiters splitting"
);

// 7. Date relative checks
const parsedTwoDaysAgo = parsePostedDate("2 days ago");
const diffTime = Math.abs(new Date() - parsedTwoDaysAgo);
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
assertEqual(diffDays <= 2, true, "PostedDate: '2 days ago' parse verification");

// 8. Similarity matching tests
assertNear(jaroWinkler("Software Engineer", "Software Developer"), 0.85, 0.05, "Similarity: Jaro-Winkler for titles");
assertNear(jaroWinkler("React Developer", "React Developer"), 1.0, 0.01, "Similarity: Jaro-Winkler identity");
assertNear(jaccardSimilarity("requires react and nodejs skills", "nodejs and react skills required"),
  0.67,
  0.05,
  "Similarity: Jaccard set overlap"
);

console.log("\n=== TEST SUITE COMPLETED ===");
