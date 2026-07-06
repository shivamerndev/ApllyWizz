import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetJobsQuery, useTailorResumeMutation } from "../api/jobs.api.js";
import { FiCpu, FiAward, FiAlertTriangle, FiCheckCircle, FiMinusCircle, FiList, FiChevronRight, FiEdit2 } from "react-icons/fi";
import { toast } from "react-hot-toast";

function ResumeTailor() {
  const [searchParams] = useSearchParams();
  const queryJobId = searchParams.get("jobId") || "";

  // Form states
  const [selectedJobId, setSelectedJobId] = useState(queryJobId);
  const [resumeText, setResumeText] = useState("");
  const [tailorResult, setTailorResult] = useState(null);

  // Fetch jobs for dropdown selection
  const { data: jobsResponse, isLoading: jobsLoading } = useGetJobsQuery({ isDuplicate: false, limit: 100 });
  const [tailorResume, { isLoading: isTailoring }] = useTailorResumeMutation();

  const jobsList = jobsResponse?.data?.jobs || [];

  // Update selectedJobId if URL parameter changes
  useEffect(() => {
    if (queryJobId) {
      setSelectedJobId(queryJobId);
    }
  }, [queryJobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      toast.error("Please select a target job posting.");
      return;
    }
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text to analyze.");
      return;
    }

    try {
      const response = await tailorResume({
        resumeText,
        jobId: selectedJobId,
      }).unwrap();
      
      toast.success("Resume matched successfully!");
      setTailorResult(response.data);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "AI Tailoring failed. Please check backend log details.");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/25";
    if (score >= 50) return "text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/25";
    return "text-rose-500 stroke-rose-500 bg-rose-500/10 border-rose-500/25";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">AI Resume Tailoring Agent</h1>
        <p className="text-slate-400 text-xs mt-1">
          Select a unique job listing and paste a resume to evaluate skills fitment and get optimization suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
            <FiEdit2 className="text-indigo-500" /> Input Parameters
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Job Selection */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Target Job Post</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                disabled={jobsLoading}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
              >
                <option value="">-- Select a Job listing --</option>
                {jobsList.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.company} &bull; {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Resume Text Area */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Resume Plain Text</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the candidate resume contents here (experience, skills, projects, certifications)..."
                rows={12}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-sans"
              />
            </div>

            {/* Tailor Button */}
            <button
              type="submit"
              disabled={isTailoring || !selectedJobId || !resumeText.trim()}
              className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-indigo-600/10"
            >
              {isTailoring ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Analyzing Skills Alignments...
                </>
              ) : (
                <>
                  <FiCpu /> Analyze & Tailor Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output/Analysis Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!tailorResult ? (
            <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-12 rounded-2xl text-center flex flex-col justify-center items-center h-full min-h-[50vh] shadow-sm">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full mb-4">
                <FiCpu size={32} />
              </div>
              <h3 className="text-slate-700 dark:text-slate-300 font-bold text-base mb-1">Awaiting AI Match Query</h3>
              <p className="text-slate-400 text-xs max-w-sm">
                Paste the resume details and hit matching button on the left to activate the Resume Tailoring analysis pipeline.
              </p>
            </div>
          ) : (
            <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 animate-slideUp">
              
              {/* Score and Overview */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-850">
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="font-black text-xl text-slate-800 dark:text-white">Analysis Match Report</h3>
                  <p className="text-xs text-slate-450">
                    A comprehensive overview of keywords matching, strengths, gaps, and improvements.
                  </p>
                </div>

                {/* Score Dial */}
                <div className={`flex flex-col items-center justify-center p-4 border rounded-2xl w-32 h-32 shrink-0 ${getScoreColor(tailorResult.matchScore)}`}>
                  <span className="text-3xl font-black">{tailorResult.matchScore}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1 text-slate-500 dark:text-slate-400">Match Score</span>
                </div>
              </div>

              {/* Missing Skills Grid */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FiAlertTriangle className="text-amber-500" />
                  Missing Skills
                </h4>
                {tailorResult.missingSkills.length === 0 ? (
                  <p className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                    <FiCheckCircle /> Excellent! All technical skills mentioned in the job description are present in the resume.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tailorResult.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Strengths & Weaknesses side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-850">
                {/* Strengths */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {tailorResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <FiChevronRight className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FiMinusCircle className="text-rose-500" /> Gaps & Concerns
                  </h4>
                  <ul className="space-y-2">
                    {tailorResult.weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <FiChevronRight className="text-rose-500 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-850">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FiList className="text-indigo-500" /> Suggestions for Improvement
                </h4>
                <ol className="space-y-3">
                  {tailorResult.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex gap-3 text-xs text-slate-600 dark:text-slate-405 leading-relaxed">
                      <span className="w-5 h-5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeTailor;
