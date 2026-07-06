import { useGetDashboardStatsQuery } from "../api/jobs.api.js";
import { FiDatabase, FiCopy, FiMapPin, FiBriefcase, FiZap, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

function Dashboard() {
  const { data: response, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading platform statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl text-center max-w-xl mx-auto my-8">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Failed to Load Dashboard</h3>
        <p className="text-red-600 dark:text-red-500 text-sm mb-4">
          {error?.data?.message || "There was a problem communicating with the backend server."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = response?.data || {
    totalJobs: 0,
    duplicateJobs: 0,
    remoteJobs: 0,
    totalCompanies: 0,
    totalLocations: 0,
    employmentTypeDistribution: {},
    topCompanies: [],
    salaryRanges: [],
    skillsFreq: [],
    recentJobs: [],
  };

  const uniqueJobsCount = stats.totalJobs - stats.duplicateJobs;
  const remotePercent = stats.totalJobs > 0 ? Math.round((stats.remoteJobs / stats.totalJobs) * 100) : 0;
  const duplicatePercent = stats.totalJobs > 0 ? Math.round((stats.duplicateJobs / stats.totalJobs) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-violet-950 rounded-xl p-6 md:p-8 text-white shadow-xl shadow-indigo-600/10">
        <h1 className="text-2xl font-semibold mb-2">Job Search & Analysis Dashboard</h1>
        <p className="text-indigo-100 max-w-2xl text-sm ">
          Analyze imported job spreadsheets, review automated duplicate grouping scores, and optimize candidates search query records in real-time.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Jobs */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Records</p>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mt-1">{stats.totalJobs}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FiDatabase size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="font-semibold text-emerald-500">{uniqueJobsCount}</span> Unique,{" "}
            <span className="font-semibold text-amber-500">{stats.duplicateJobs}</span> Duplicates
          </div>
        </div>

        {/* Duplicate Jobs */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duplicate Matches</p>
              <h3 className="text-2xl font-semibold text-amber-500 mt-1">{stats.duplicateJobs}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
              <FiCopy size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${duplicatePercent}%` }}></div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Deduplication Ratio</span>
            <span className="font-semibold text-amber-500">{duplicatePercent}%</span>
          </div>
        </div>

        {/* Remote Jobs */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remote Positions</p>
              <h3 className="text-2xl font-semibold text-emerald-500 mt-1">{stats.remoteJobs}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
              <FiZap size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${remotePercent}%` }}></div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Overall Remote Share</span>
            <span className="font-semibold text-emerald-500">{remotePercent}%</span>
          </div>
        </div>

        {/* Companies & Locations */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hiring Coverage</p>
              <h3 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.totalCompanies} <span className="text-sm font-normal text-slate-400">Cos.</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FiMapPin size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Spread across <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.totalLocations}</span> distinct locations
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hiring Companies */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <FiBriefcase className="text-indigo-500" />
              Top Hiring Companies
            </h3>
            {stats.topCompanies.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">No hiring companies data found.</p>
            ) : (
              <div className="space-y-4">
                {stats.topCompanies.map((company, index) => {
                  const maxCount = stats.topCompanies[0]?.count || 1;
                  const percentWidth = Math.max(10, Math.round((company.count / maxCount) * 100));
                  return (
                    <div key={company.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {index + 1}. {company.name}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {company.count} {company.count === 1 ? "job" : "jobs"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-right">
            <Link to="/jobs" className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline">
              Search all companies &rarr;
            </Link>
          </div>
        </div>

        {/* Employment Type Distribution */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Employment Types</h3>
          <div className="space-y-4">
            {Object.keys(stats.employmentTypeDistribution).length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">No employment distribution found.</p>
            ) : (
              Object.entries(stats.employmentTypeDistribution).map(([type, count]) => {
                const total = stats.totalJobs || 1;
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={type} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40 rounded-xl hover:scale-[1.02] transition-transform">
                    <div className="space-y-0.5">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{type}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{percent}% of all jobs</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                      {count}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Skills and Recent Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Demanded Skills */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Top Demanded Skills</h3>
          {stats.skillsFreq.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No skills frequency extracted.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.skillsFreq.map((skill) => (
                <span
                  key={skill.name}
                  className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm"
                >
                  {skill.name}
                  <span className="px-1.5 py-0.5 bg-indigo-200/50 dark:bg-indigo-900/60 rounded-full text-[10px] text-indigo-800 dark:text-indigo-300">
                    {skill.count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recently Added Canonical Jobs */}
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <FiCheckCircle className="text-emerald-500" />
              Recently Imported Jobs (Unique)
            </h3>
            {stats.recentJobs.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">No unique jobs imported yet. Visit the import tab!</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentJobs.map((job) => (
                  <div key={job._id} className="py-3 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-xl transition">
                    <div className="min-w-0 pr-4">
                      <Link to={`/jobs/${job._id}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.company} &bull; {job.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-semibold rounded">
                        {job.employmentType}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(job.postedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-right">
            <Link to="/jobs" className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline">
              View all listings &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
