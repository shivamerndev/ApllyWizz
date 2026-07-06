import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockJobs = [
  {
    Title: "Senior Software Engineer",
    Company: "Google LLC",
    Location: "New York, NY",
    Description: "We are looking for a Senior Software Engineer to join our team. Must have experience with React, Node.js, and MongoDB.",
    Skills: "React, Node.js, MongoDB, JavaScript",
    Salary: "$140,000 - $180,000",
    Experience: "5+ years",
    EmploymentType: "Full-time",
    PostedDate: "3 days ago",
    Source: "LinkedIn",
    SourceUrl: "https://linkedin.com/jobs/123",
  },
  {
    // Near duplicate of Job 1 (same company normalized, similar title, similar description)
    Title: "Sr. Software Engineer",
    Company: "Google",
    Location: "New York",
    Description: "Google is hiring a Senior Software Engineer to build scalable web applications. Requirements include React, Node.js, and MongoDB database schema design.",
    Skills: "React, Node.js, MongoDB",
    Salary: "150000 USD",
    Experience: "5 years",
    EmploymentType: "FT",
    PostedDate: "2 days ago",
    Source: "Indeed",
    SourceUrl: "https://indeed.com/jobs/456",
  },
  {
    // Exact duplicate of Job 1
    Title: "Senior Software Engineer",
    Company: "Google LLC",
    Location: "New York, NY",
    Description: "We are looking for a Senior Software Engineer to join our team. Must have experience with React, Node.js, and MongoDB.",
    Skills: "React, Node.js, MongoDB, JavaScript",
    Salary: "$140,000 - $180,000",
    Experience: "5+ years",
    EmploymentType: "Full-time",
    PostedDate: "3 days ago",
    Source: "LinkedIn",
    SourceUrl: "https://linkedin.com/jobs/123",
  },
  {
    // Unique Job
    Title: "Frontend Developer",
    Company: "Microsoft Corporation",
    Location: "Redmond, WA (Remote)",
    Description: "Microsoft is looking for a Frontend Developer with excellent skills in React, TypeScript, and Tailwind CSS. Join our web team.",
    Skills: "React, TypeScript, CSS",
    Salary: "$110,000 - $130,000",
    Experience: "3-5 years",
    EmploymentType: "Full-time",
    PostedDate: "yesterday",
    Source: "Indeed",
    SourceUrl: "https://indeed.com/jobs/789",
  },
  {
    // Unique Job
    Title: "Backend Engineer",
    Company: "Amazon",
    Location: "Seattle, WA",
    Description: "Amazon's team is looking for a Backend developer with extensive Java, Spring Boot, and AWS cloud experience.",
    Skills: "Java, AWS, Spring Boot",
    Salary: "$130k - $160k",
    Experience: "3+ yrs",
    EmploymentType: "Full-time",
    PostedDate: "July 4, 2026",
    Source: "Glassdoor",
    SourceUrl: "https://glassdoor.com/jobs/101",
  },
  {
    // Invalid Job (missing Title)
    Title: "",
    Company: "Netflix",
    Location: "Los Gatos, CA",
    Description: "Software Developer job posting with missing title information.",
    Skills: "React",
    Salary: "$200,000",
    Experience: "2 years",
    EmploymentType: "Full-time",
    PostedDate: "today",
    Source: "LinkedIn",
    SourceUrl: "https://linkedin.com/jobs/102",
  },
];

const worksheet = xlsx.utils.json_to_sheet(mockJobs);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Jobs");

// Write file to project root
const outputPath = path.join(__dirname, "../../../mock_jobs.xlsx");
xlsx.writeFile(workbook, outputPath);

console.log(`✅ Mock Excel spreadsheet successfully created at: ${outputPath}`);
