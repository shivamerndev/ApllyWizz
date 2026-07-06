import { useState } from "react";
import { useGetDuplicatesQuery, useResolveDuplicateMutation } from "../api/jobs.api.js";
import { FiCopy, FiCheckCircle, FiAlertCircle, FiInfo, FiTrendingUp, FiArrowRight, FiFileText } from "react-icons/fi";
import { toast } from "react-hot-toast";

function DuplicateResolver() {
  const { data: response, isLoading, error, refetch } = useGetDuplicatesQuery();
  const [resolveDuplicate, { isLoading: isResolving }] = useResolveDuplicateMutation();

  // State to hold selected group and selected duplicate index
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedDupIndex, setSelectedDupIndex] = useState(0);

  const duplicateGroups = response?.data || [];

  // Get current active group
  const activeGroup = duplicateGroups.find(g => g._id === selectedGroupId) || duplicateGroups[0];

  // Set default selection if not set
  if (duplicateGroups.length > 0 && !selectedGroupId) {
    setSelectedGroupId(duplicateGroups[0]._id);
    setSelectedDupIndex(0);
  }

  const handleResolveUnique = async (dupId) => {
    try {
      await resolveDuplicate({ id: dupId, action: "resolve_unique" }).unwrap();
      toast.success("Listing marked as a unique canonical job.");
      
      // Reset index pointers if necessary
      if (activeGroup && activeGroup.duplicates.length <= 1) {
        setSelectedGroupId(null);
      } else {
        setSelectedDupIndex(0);
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update record status.");
    }
  };

  const handleConfirmDuplicate = async (dupId) => {
    try {
      await resolveDuplicate({ id: dupId, action: "confirm" }).unwrap();
      toast.success("Duplicate status verified.");
      
      // Advance to next or wrap up
      if (activeGroup && selectedDupIndex < activeGroup.duplicates.length - 1) {
        setSelectedDupIndex(prev => prev + 1);
      } else {
        toast.info("Reached the end of this duplicate group.");
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to verify duplicate.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Scanning database for duplicate groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 rounded-2xl text-center max-w-xl mx-auto my-8">
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400 mb-2">Error scanning duplicates</h3>
        <p className="text-rose-600 dark:text-rose-500 text-sm">{error?.data?.message || "Communication failed."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Duplicate Records Resolver</h1>
        <p className="text-slate-400 text-xs mt-1">
          Review potential near-duplicate jobs detected during imports. Verify duplicates or re-classify them as unique canonical postings.
        </p>
      </div>

      {duplicateGroups.length === 0 ? (
        <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-12 rounded-2xl text-center max-w-2xl mx-auto">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full w-fit mx-auto mb-4">
            <FiCheckCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">All Clean! No Duplicates Detected</h3>
          <p className="text-slate-400 text-sm">
            The duplicate detection engine has found 0 near-duplicate sets in your MongoDB dataset. Try importing new spreadsheets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[72vh]">
          {/* Duplicate Groups Sidebar */}
          <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Duplicate Groups ({duplicateGroups.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
              {duplicateGroups.map((group) => {
                const isSelected = group._id === selectedGroupId;
                return (
                  <button
                    key={group._id}
                    onClick={() => {
                      setSelectedGroupId(group._id);
                      setSelectedDupIndex(0);
                    }}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors flex justify-between items-start gap-2 ${
                      isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                        {group.canonical.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{group.canonical.company}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{group.canonical.location}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/30 text-amber-600 dark:text-amber-400 rounded">
                      {group.duplicates.length} Matches
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side-by-side Comparison Area */}
          <div className="lg:col-span-2 flex flex-col h-full gap-6 overflow-hidden">
            {activeGroup && (
              <>
                {/* Tabs to select active duplicate within group */}
                {activeGroup.duplicates.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                    {activeGroup.duplicates.map((dup, idx) => (
                      <button
                        key={dup._id}
                        onClick={() => setSelectedDupIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition ${
                          selectedDupIndex === idx
                            ? "bg-indigo-600 text-white border-transparent"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                        }`}
                      >
                        Duplicate Match {idx + 1} ({(dup.duplicateScore * 100).toFixed(0)}% Match)
                      </button>
                    ))}
                  </div>
                )}

                {/* Side-by-side View */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto min-h-0 pr-1">
                  {/* Canonical Panel */}
                  <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl space-y-4 h-fit">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/20 px-2 py-0.5 rounded">
                        Canonical Record (Master)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Job Title</h4>
                      <p className="text-sm font-black text-slate-850 dark:text-white">{activeGroup.canonical.title}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Company</h4>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-350">{activeGroup.canonical.company}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Location / Remote</h4>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {activeGroup.canonical.location} {activeGroup.canonical.remote && "(Remote)"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Salary Range</h4>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {activeGroup.canonical.salaryMin !== null
                          ? `${activeGroup.canonical.currency} ${activeGroup.canonical.salaryMin.toLocaleString()} - ${activeGroup.canonical.salaryMax?.toLocaleString()}`
                          : activeGroup.canonical.salary || "Not Specified"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Experience</h4>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {activeGroup.canonical.experience || "Not Specified"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {activeGroup.canonical.skills.length > 0 ? (
                          activeGroup.canonical.skills.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None Specified</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Description Snippet</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-6">
                        {activeGroup.canonical.description}
                      </p>
                    </div>
                  </div>

                  {/* Duplicate Panel */}
                  {activeGroup.duplicates[selectedDupIndex] && (
                    <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl space-y-4 h-fit">
                      <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/20 px-2 py-0.5 rounded flex items-center gap-1">
                          Duplicate Match (Score: {(activeGroup.duplicates[selectedDupIndex].duplicateScore * 100).toFixed(0)}%)
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Job Title</h4>
                        <p className={`text-sm font-black ${
                          activeGroup.canonical.title.toLowerCase() !== activeGroup.duplicates[selectedDupIndex].title.toLowerCase()
                            ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 px-1 rounded"
                            : "text-slate-850 dark:text-white"
                        }`}>
                          {activeGroup.duplicates[selectedDupIndex].title}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Company</h4>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
                          {activeGroup.duplicates[selectedDupIndex].company}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Location / Remote</h4>
                        <p className={`text-xs font-semibold ${
                          activeGroup.canonical.location.toLowerCase() !== activeGroup.duplicates[selectedDupIndex].location?.toLowerCase()
                            ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 px-1 rounded"
                            : "text-slate-600 dark:text-slate-400"
                        }`}>
                          {activeGroup.duplicates[selectedDupIndex].location} {activeGroup.duplicates[selectedDupIndex].remote && "(Remote)"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Salary Range</h4>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {activeGroup.duplicates[selectedDupIndex].salaryMin !== null
                            ? `${activeGroup.duplicates[selectedDupIndex].currency} ${activeGroup.duplicates[selectedDupIndex].salaryMin.toLocaleString()} - ${activeGroup.duplicates[selectedDupIndex].salaryMax?.toLocaleString()}`
                            : activeGroup.duplicates[selectedDupIndex].salary || "Not Specified"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Experience</h4>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {activeGroup.duplicates[selectedDupIndex].experience || "Not Specified"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {activeGroup.duplicates[selectedDupIndex].skills.length > 0 ? (
                            activeGroup.duplicates[selectedDupIndex].skills.map(s => {
                              const inCanonical = activeGroup.canonical.skillsNormalized.includes(s.toLowerCase());
                              return (
                                <span
                                  key={s}
                                  className={`px-2 py-0.5 text-[10px] rounded ${
                                    !inCanonical 
                                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-450 border border-amber-200/20" 
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {s}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-400">None Specified</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-850">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Description Snippet</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-6">
                          {activeGroup.duplicates[selectedDupIndex].description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resolution Action Footer */}
                {activeGroup.duplicates[selectedDupIndex] && (
                  <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-md">
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs">
                      <FiInfo size={16} className="text-indigo-500 shrink-0" />
                      <p>
                        Confirm duplicate status to retain current grouping, or split this record out as a unique posting.
                      </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => handleResolveUnique(activeGroup.duplicates[selectedDupIndex]._id)}
                        disabled={isResolving}
                        className="flex-1 sm:flex-none px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-50"
                      >
                        Split (Mark Unique)
                      </button>
                      <button
                        onClick={() => handleConfirmDuplicate(activeGroup.duplicates[selectedDupIndex]._id)}
                        disabled={isResolving}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-50"
                      >
                        Confirm Duplicate
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DuplicateResolver;
