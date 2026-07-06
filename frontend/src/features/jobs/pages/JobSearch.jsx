import { useState } from "react";
import { useGetJobsQuery } from "../api/jobs.api.js";
import { Link } from "react-router-dom";
import { FiSearch, FiMapPin, FiBriefcase, FiDollarSign, FiCalendar, FiChevronLeft, FiChevronRight, FiGrid, FiList, FiCheckCircle, FiCopy } from "react-icons/fi";

function JobSearch() {
  // Query Filters State
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [remote, setRemote] = useState("");
  const [experience, setExperience] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [isDuplicate, setIsDuplicate] = useState("false"); // default hide duplicates
  const [sortBy, setSortBy] = useState("postedDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Active triggers (sent to API)
  const [queryParams, setQueryParams] = useState({
    search: "",
    company: "",
    location: "",
    employmentType: "",
    remote: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    isDuplicate: "false",
    sortBy: "postedDate",
    sortOrder: "desc",
    page: 1,
    limit: 8,
  });

  const { data: response, isLoading, error } = useGetJobsQuery(queryParams);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setQueryParams({
      search,
      company,
      location,
      employmentType,
      remote,
      experience,
      salaryMin,
      salaryMax,
      isDuplicate,
      sortBy,
      sortOrder,
      page: 1,
      limit: 8,
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setCompany("");
    setLocation("");
    setEmploymentType("");
    setRemote("");
    setExperience("");
    setSalaryMin("");
    setSalaryMax("");
    setIsDuplicate("false");
    setSortBy("postedDate");
    setSortOrder("desc");
    setPage(1);
    setQueryParams({
      search: "",
      company: "",
      location: "",
      employmentType: "",
      remote: "",
      experience: "",
      salaryMin: "",
      salaryMax: "",
      isDuplicate: "false",
      sortBy: "postedDate",
      sortOrder: "desc",
      page: 1,
      limit: 8,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const jobsData = response?.data || { jobs: [], total: 0, page: 1, pages: 1 };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Hiring Database</h1>
          <p className="text-slate-400 text-xs mt-1">
            Search, filter, and review details of all matching positions in the platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl h-fit space-y-5 lg:sticky lg:top-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Faceted Search</h3>

          <form onSubmit={handleApplyFilters} className="space-y-4">
            {/* Search */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Keywords</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, skills, keyword..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Microsoft..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New York, Remote..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Job Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Exp. (Years)</label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Salary Range */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Salary Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Remote */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Workplace</label>
              <select
                value={remote}
                onChange={(e) => setRemote(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="">Anywhere</option>
                <option value="true">Remote Only</option>
                <option value="false">On-site / Hybrid</option>
              </select>
            </div>

            {/* Duplicate Filter */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Duplicates</label>
              <select
                value={isDuplicate}
                onChange={(e) => setIsDuplicate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="">Show All</option>
                <option value="false">Unique Jobs Only</option>
                <option value="true">Duplicate Matches Only</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-2/3 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="postedDate">Date Posted</option>
                  <option value="salaryMin">Salary Min</option>
                  <option value="experienceMin">Experience</option>
                  <option value="title">Job Title</option>
                  <option value="company">Company</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-1/3 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition active:scale-95 shadow-sm"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-1/2 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Jobs List Grid */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="text-slate-400 text-sm font-medium">Querying jobs database...</p>
            </div>
          ) : error ? (
            <div className="glass-card bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/50 p-8 rounded-2xl text-center">
              <p className="text-rose-700 dark:text-rose-400 font-semibold mb-2">Search Query Failed</p>
              <p className="text-rose-500 dark:text-rose-500 text-xs">
                {error?.data?.message || "There was a problem carrying out the query."}
              </p>
            </div>
          ) : jobsData.jobs.length === 0 ? (
            <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-12 rounded-2xl text-center">
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg mb-1">No Jobs Found</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                No job listings match your current filters. Try relaxing your search criteria or clear filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider px-2">
                <span>Found {jobsData.total} Matching listings</span>
                <span>Page {jobsData.page} of {jobsData.pages}</span>
              </div>

              {/* Jobs List */}
              <div className="grid grid-cols-1 gap-4">
                {jobsData.jobs.map((job) => (
                  <div
                    key={job._id}
                    className={`glass-card p-5 bg-white dark:bg-slate-900 border rounded-2xl transition hover:shadow-md hover:scale-[1.005] ${
                      job.isDuplicate 
                        ? "border-amber-200 dark:border-amber-950/40 bg-amber-500/[0.01]" 
                        : "border-slate-200/50 dark:border-slate-800/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="text-base font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {job.title}
                          </Link>
                          {job.isDuplicate ? (
                            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/30 text-[9px] font-bold uppercase rounded flex items-center gap-1">
                              <FiCopy size={8} /> Duplicate Match
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 text-[9px] font-bold uppercase rounded flex items-center gap-1">
                              <FiCheckCircle size={8} /> Canonical
                            </span>
                          )}
                          {job.remote && (
                            <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/30 text-[9px] font-bold uppercase rounded">
                              Remote
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                          {job.company}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-slate-400" />
                            {job.location || "Location Not Specified"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiBriefcase className="text-slate-400" />
                            {job.employmentType}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiDollarSign className="text-slate-400" />
                            {job.salaryMin !== null ? (
                              <span>
                                {job.currency} {job.salaryMin.toLocaleString()}{" "}
                                {job.salaryMax && job.salaryMax !== job.salaryMin ? `- ${job.salaryMax.toLocaleString()}` : ""}
                              </span>
                            ) : (
                              <span>{job.salary || "Not Disclosed"}</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Right metadata / action */}
                      <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          <FiCalendar />
                          {new Date(job.postedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                        
                        <Link
                          to={`/jobs/${job._id}`}
                          className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          View Details &rarr;
                        </Link>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/40">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[10px] font-semibold rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="px-2 py-0.5 bg-slate-55 text-slate-400 text-[10px] font-semibold">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {jobsData.pages > 1 && (
                <div className="flex justify-between items-center pt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
                  >
                    <FiChevronLeft /> Prev
                  </button>

                  <span className="text-xs text-slate-400 font-bold">
                    Page {page} of {jobsData.pages}
                  </span>

                  <button
                    disabled={page === jobsData.pages}
                    onClick={() => handlePageChange(page + 1)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobSearch;
