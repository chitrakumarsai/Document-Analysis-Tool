import React, { useState, useCallback, useMemo } from "react";
import { PulseLoader } from "react-spinners";
// For toast notifications, you'd typically install: npm install react-toastify
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

export default function PatentForm() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [titleCol, setTitleCol] = useState("");
  const [abstractCol, setAbstractCol] = useState("");
  const [claimsCol, setClaimsCol] = useState("");
  const [customPrompt, setCustomPrompt] = useState(
    "You are a patent analysis expert. Respond only in valid JSON format with fields: relevance_score, reasoning, follow_up_recommended, SUMMARY."
  );
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // For inline error messages

  const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleFileChange = useCallback(async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setError(null); // Clear previous errors
    setColumns([]); // Clear columns when new file is selected
    setTitleCol("");
    setAbstractCol("");
    setClaimsCol("");
    setResults([]); // Clear results on new file upload

    const fd = new FormData();
    fd.append("file", selected);
    setLoading(true);
    try {
      const res = await fetch(`${API}/columns`, { method: "POST", body: fd });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Could not load columns.");
      }
      const { columns: fetchedColumns } = await res.json();
      setColumns(fetchedColumns);

      // Attempt to pre-select common column names (case-insensitive)
      setTitleCol(fetchedColumns.find(c => c.toLowerCase().includes("title")) || fetchedColumns[0] || "");
      setAbstractCol(fetchedColumns.find(c => c.toLowerCase().includes("abstract")) || fetchedColumns[1] || "");
      setClaimsCol(fetchedColumns.find(c => c.toLowerCase().includes("claims")) || fetchedColumns[2] || "");

      // toast.success("File uploaded and columns loaded!");
    } catch (err) {
      console.error("File upload error:", err);
      setError("Failed to load columns: " + err.message);
      // toast.error("Failed to load columns: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!file || !titleCol || !abstractCol || !claimsCol || !customPrompt) {
      setError("Please ensure all required fields are selected.");
      // toast.warn("Please ensure all fields are selected.");
      return;
    }

    if (new Set([titleCol, abstractCol, claimsCol]).size < 3) {
      setError("Title, Abstract, and Claims columns must be unique.");
      // toast.error("Title, Abstract, and Claims columns must be unique.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title_col", titleCol);
    fd.append("abstract_col", abstractCol);
    fd.append("claims_col", claimsCol);
    fd.append("custom_prompt", customPrompt);

    setLoading(true);
    setResults([]); // Clear previous results before new analysis
    try {
      const res = await fetch(`${API}/analyze`, { method: "POST", body: fd });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Unknown analysis error.");
      }
      const data = await res.json();
      setResults(data);
      // toast.success("Analysis complete!");
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed: " + err.message);
      // toast.error("Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [file, titleCol, abstractCol, claimsCol, customPrompt, API]);

  const handleExportCSV = useCallback(() => {
    if (!results.length) {
      // toast.info("No results to export.");
      return;
    }
    const headers = Object.keys(results[0]);
    const csv = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...results.map(row =>
        headers.map(h => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patent_analysis_results.csv";
    document.body.appendChild(a); // Append to body to ensure it's clickable
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url);
    // toast.success("Results exported successfully!");
  }, [results]);

  // Memoize column options for performance
  const columnOptions = useMemo(() => {
    return columns.map(c => (
      <option key={c} value={c}>
        {c}
      </option>
    ));
  }, [columns]);

  // Function to determine if a column option should be disabled
  const isColumnOptionDisabled = useCallback((col, currentField) => {
    if (currentField === 'title' && (col === abstractCol || col === claimsCol)) return true;
    if (currentField === 'abstract' && (col === titleCol || col === claimsCol)) return true;
    if (currentField === 'claims' && (col === titleCol || col === abstractCol)) return true;
    return false;
  }, [titleCol, abstractCol, claimsCol]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      {/* <ToastContainer position="bottom-right" autoClose={3000} /> */}
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Patent <span className="text-blue-600">Analysis</span> Tool
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Effortlessly analyze patent data by uploading your files and defining custom AI instructions.
          </p>
        </div>

        {/* Main Form Section */}
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* File Upload */}
            <div className="md:col-span-2">
              <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Patent Data File <span className="text-gray-500">(CSV, XLSX)</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden" // Hide default input
                />
                <label
                  htmlFor="file-upload"
                  className="flex-grow flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors duration-200 ease-in-out"
                >
                  {/* Smaller upload icon (w-3 h-3) and reduced mr-1 */}
                  <svg className="w-3 h-3 mr-1 -ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 0 003 3h10a3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  {file ? file.name : "Choose File"}
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setColumns([]);
                      setTitleCol("");
                      setAbstractCol("");
                      setClaimsCol("");
                      setResults([]);
                      setError(null);
                      // toast.info("File cleared.");
                    }}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Clear selected file"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                )}
              </div>
              {loading && file && (
                <p className="mt-3 text-sm text-gray-600 flex items-center animate-pulse">
                  <PulseLoader size={5} color="#4F46E5" className="mr-2" />
                  Processing file and loading columns...
                </p>
              )}
            </div>

            {/* Column Selectors */}
            {[
              { label: "Title Column", state: titleCol, setter: setTitleCol, field: "title" },
              { label: "Abstract Column", state: abstractCol, setter: setAbstractCol, field: "abstract" },
              { label: "Claims Column", state: claimsCol, setter: setClaimsCol, field: "claims" },
            ].map(({ label, state, setter, field }) => (
              <div key={field} className="flex flex-col">
                <label htmlFor={`${field}-col`} className="mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <select
                  id={`${field}-col`}
                  value={state}
                  onChange={e => setter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 text-gray-900
                             focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ease-in-out
                             disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={columns.length === 0 || loading}
                  required
                >
                  <option value="">Select {label.split(' ')[0]} Column</option>
                  {columnOptions.map(option => (
                    <option
                      key={option.key}
                      value={option.props.value}
                      disabled={isColumnOptionDisabled(option.props.value, field)}
                      className={isColumnOptionDisabled(option.props.value, field) ? "text-gray-400" : ""}
                    >
                      {option.props.children}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Spacer for layout symmetry if needed, or remove if 3 columns are desired */}
            <div className="hidden md:block"></div>

            {/* System Instruction */}
            <div className="md:col-span-2 flex flex-col">
              <label htmlFor="custom-prompt" className="mb-2 text-sm font-semibold text-gray-700">
                System Instruction
                <span className="ml-2 text-gray-500 font-normal text-xs">(AI's guiding prompt)</span>
              </label>
              <textarea
                id="custom-prompt"
                className="w-full h-48 resize-y rounded-lg border-gray-300 p-4 font-mono text-sm text-gray-800 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                rows="5"
              />
              <p className="mt-2 text-sm text-gray-500">
                Craft a precise prompt for the AI. Ensure it requests a valid JSON output with specified fields.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center animate-fade-in">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Analyze button */}
            <div className="md:col-span-2 flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading || columns.length === 0 || !file}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-bold text-white
                           bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full shadow-lg
                           hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-300 ease-in-out
                           focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <PulseLoader size={6} color="white" /> {/* Smaller loader */}
                    <span>Analyzing…</span>
                  </>
                ) : (
                  <>
                    {/* Smaller icon (w-5 h-5) */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 space-y-8 mt-12 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <h2 className="text-4xl font-extrabold text-gray-900">Analysis Results</h2>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-md
                           hover:bg-green-700 transform hover:scale-105 transition-all duration-300 ease-in-out
                           focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results[0]).map(key => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                      >
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {results.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="px-6 py-4 text-sm text-gray-800 break-words max-w-xs"
                          title={String(val)} // Full text on hover
                        >
                          {/* Truncate long text for table display, show full on hover */}
                          {`${val}`.length > 150
                            ? `${String(val).slice(0, 150)}…`
                            : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.length > 0 && (
              <p className="text-center text-gray-600 text-sm mt-6">
                Displaying {results.length} results. For larger datasets, consider implementing pagination or virtualization.
              </p>
            )}
          </div>
        )}
      </div>
      {/* Add global styles for animations if not already in your CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}