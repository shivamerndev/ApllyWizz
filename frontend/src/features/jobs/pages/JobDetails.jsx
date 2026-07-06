import { useParams, Link } from "react-router-dom";
import { useGetJobDetailsQuery } from "../api/jobs.api.js";
import { FiArrowLeft, FiMapPin, FiBriefcase, FiDollarSign, FiCalendar, FiExternalLink, FiAward, FiCopy, FiCpu, FiTag } from "react-icons/fi";

function JobDetails() {
  const { id } = useParams();
  const { data: response, isLoading, error } = useGetJobDetailsQuery(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Retrieving job specification details...</p>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 rounded-2xl text-center max-w-xl mx-auto my-8">
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400 mb-2">Job Details Not Found</h3>
        <p className="text-rose-600 dark:text-rose-500 text-sm mb-4">
          {error?.data?.message || "The requested job listing ID could not be found or has been deleted."}
        </p>
        <Link 
          to="/jobs"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
        >
          Return to Database
        </Link>
      </div>
    );
  }

  const { job, duplicates = [], canonical = null } = response.data;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold transition">
          <FiArrowLeft /> Back to Job Database
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job details card */}
        <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-2xl lg:col-span-2 space-y-6 shadow-sm">
          {/* Header */}
          <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-850">
            <div className="flex flex-wrap items-center gap-2">
              {job.isDuplicate ? (
                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/30 text-[9px] font-bold uppercase rounded flex items-center gap-1">
                  <FiCopy size={8} /> Duplicate Match (Score: {job.duplicateScore})
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 text-[9px] font-bold uppercase rounded flex items-center gap-1">
                  <FiAward size={8} /> Canonical Listing
                </span>
              )}
              {job.remote && (
                <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/30 text-[9px] font-bold uppercase rounded">
                  Remote Allowed
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight">
              {job.title}
            </h1>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-base font-bold text-slate-700 dark:text-slate-350">{job.company}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <FiCalendar />
                Posted: {new Date(job.postedDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/50 p-4 border border-slate-100 dark:border-slate-850/50 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                <FiMapPin /> Location
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{job.location || "Not Specified"}</p>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                <FiBriefcase /> Job Type
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{job.employmentType}</p>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                <FiDollarSign /> Salary
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {job.salaryMin !== null ? (
                  <span>
                    {job.currency} {job.salaryMin.toLocaleString()}{" "}
                    {job.salaryMax && job.salaryMax !== job.salaryMin ? `- ${job.salaryMax.toLocaleString()}` : ""}
                  </span>
                ) : (
                  <span>{job.salary || "Not Disclosed"}</span>
                )}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Job Description</h3>
            <div className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line space-y-4">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          {job.skills.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <FiTag className="text-indigo-500" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/20 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Experience Level</span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{job.experience || "Not Disclosed"}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Department</span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{job.department || "General"}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Source Origin</span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{job.source || "Spreadsheet upload"}</p>
            </div>
            {job.sourceUrl && (
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Apply Link</span>
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1.5"
                >
                  Visit Job Source <FiExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar details (Resume tailoring quick launcher & Duplicate Info) */}
        <div className="space-y-6">
          {/* Resume tailoring agent widget */}
          <div className="glass-card bg-indigo-600 dark:bg-indigo-950 p-6 rounded-2xl text-white space-y-4 shadow-lg shadow-indigo-600/10">
            <div className="p-3 bg-white/10 w-fit rounded-xl">
              <FiCpu size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg">Resume Tailoring Agent</h3>
              <p className="text-indigo-100 text-xs mt-1.5 leading-relaxed">
                Analyze your resume against this job. Get a match score, missing skills list, and improvements in seconds.
              </p>
            </div>
            <Link
              to={`/tailor?jobId=${job._id}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-indigo-700 font-black rounded-xl text-sm transition shadow-md active:scale-95"
            >
              Tailor Resume
            </Link>
          </div>

          {/* Duplicate Matches list */}
          <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Deduplication Report</h3>

            {/* If current job IS duplicate */}
            {job.isDuplicate && canonical && (
              <div className="space-y-3">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200/20">
                  Warning: This listing has been identified as a near-duplicate of a canonical parent record.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Canonical Parent</p>
                  <Link to={`/jobs/${canonical._id}`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline block mt-1">
                    {canonical.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{canonical.company} &bull; {canonical.location}</p>
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                    <span className="text-slate-400">Match score</span>
                    <span className="font-bold text-amber-500">{(job.duplicateScore * 100).toFixed(1)}% similarity</span>
                  </div>
                </div>
                <Link to="/duplicates" className="w-full inline-flex justify-center py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                  Manage Duplicate Groups
                </Link>
              </div>
            )}

            {/* If current job is canonical and HAS duplicates */}
            {!job.isDuplicate && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  This is the master canonical listing. {duplicates.length === 0 ? "No duplicates found for this record." : `Found ${duplicates.length} duplicate matching postings.`}
                </p>
                
                {duplicates.length > 0 && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {duplicates.map((dup) => (
                      <div key={dup._id} className="py-2.5 first:pt-0">
                        <Link to={`/jobs/${dup._id}`} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
                          {dup.title}
                        </Link>
                        <p className="text-[10px] text-slate-400 mt-0.5">Location: {dup.location}</p>
                        <div className="flex justify-between text-[10px] mt-1 text-slate-500">
                          <span>Similarity</span>
                          <span className="font-semibold text-amber-500">{(dup.duplicateScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {duplicates.length > 0 && (
                  <Link to="/duplicates" className="w-full inline-flex justify-center py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                    Compare & Resolve Duplicates
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
