import { useState } from "react";
import { useImportJobsMutation } from "../api/jobs.api.js";
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiCopy, FiSlash } from "react-icons/fi";
import { toast } from "react-hot-toast";

function ExcelImport() {
  const [file, setFile] = useState(null);
  const [importJobs, { isLoading }] = useImportJobsMutation();
  const [summary, setSummary] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.name.endsWith(".xlsx")
      ) {
        setFile(selectedFile);
        setSummary(null); // clear old summaries
      } else {
        toast.error("Please upload a valid Excel (.xlsx) file.");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (
        droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.name.endsWith(".xlsx")
      ) {
        setFile(droppedFile);
        setSummary(null);
      } else {
        toast.error("Please upload a valid Excel (.xlsx) file.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await importJobs(formData).unwrap();
      toast.success(response.message || "Excel sheet imported successfully!");
      setSummary(response.data);
      setFile(null); // reset file state
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Import failed. Please verify your file format.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Import Job Dataset</h1>
        <p className="text-slate-400 text-xs mt-1">
          Upload Excel sheets (.xlsx) to bulk-populate the platform with job postings and identify duplicates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Select Spreadsheet</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 md:p-12 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/20 group"
                onClick={() => document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Drag & drop your Excel file here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Accepts only standard Excel files (.xlsx) up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Selected File Details */}
              {file && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                      <FiFile size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition"
                  >
                    <FiSlash size={16} />
                  </button>
                </div>
              )}

              {/* Upload Action Button */}
              <button
                type="submit"
                disabled={!file || isLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-indigo-600/10"
              >
                {isLoading ? "Analyzing & Normalizing Rows..." : "Process Dataset"}
              </button>
            </form>
          </div>

          {/* Import Summary Results */}
          {summary && (
            <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 animate-slideUp">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Import Summary</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Rows</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{summary.totalRows}</p>
                </div>
                {/* Success */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-xl text-center">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex justify-center items-center gap-1">
                    <FiCheckCircle size={10} /> Imported
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {summary.imported - summary.duplicatesFound}
                  </p>
                </div>
                {/* Duplicates */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/20 rounded-xl text-center">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex justify-center items-center gap-1">
                    <FiCopy size={10} /> Duplicates
                  </p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.duplicatesFound}</p>
                </div>
                {/* Failed */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 rounded-xl text-center">
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider flex justify-center items-center gap-1">
                    <FiAlertCircle size={10} /> Failed
                  </p>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary.failed}</p>
                </div>
              </div>

              {summary.failed > 0 && (
                <div className="flex gap-2.5 p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/30 rounded-xl text-rose-700 dark:text-rose-450 text-xs">
                  <FiAlertCircle size={16} className="shrink-0" />
                  <p>
                    {summary.failed} row(s) failed validation checks (missing Title/Company) and were safely skipped without interrupting the pipeline.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info - Column Checklist */}
        <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl h-fit space-y-5">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Schema Guidelines</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform accepts spreadsheets containing headers related to job posts. It normalizes data formats automatically.
          </p>

          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-450">
            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Recognized Column Headers</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">Title</span> 
                <span className="text-[11px] text-slate-400"> (Required: title, jobTitle, Title)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">Company</span> 
                <span className="text-[11px] text-slate-400"> (Required: company, companyName, Company)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">Location</span> 
                <span className="text-[11px] text-slate-400"> (e.g. Remote, City - extracts remote status)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">Description</span> 
                <span className="text-[11px] text-slate-400"> (Supports raw text, used in similarity scores)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">Salary</span> 
                <span className="text-[11px] text-slate-400"> (e.g. $80K - $120K, £60,000, 1500000 INR)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">Experience</span> 
                <span className="text-[11px] text-slate-400"> (e.g. 3+ years, 5-8 yrs, Entry level)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">Skills</span> 
                <span className="text-[11px] text-slate-400"> (Comma-separated list e.g. React, Node, SQL)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 font-mono">PostedDate</span> 
                <span className="text-[11px] text-slate-400"> (Date format or "3 days ago")</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExcelImport;
