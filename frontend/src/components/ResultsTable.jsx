import React from "react";

const ResultsTable = ({ results }) => {
  if (!results.length) return null;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Score</th>
            <th className="border px-4 py-2">Summary</th>
            <th className="border px-4 py-2">Reasoning</th>
            <th className="border px-4 py-2">Follow-up</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{r.relevance_score}</td>
              <td className="border px-4 py-2">{r.SUMMARY}</td>
              <td className="border px-4 py-2">{r.reasoning}</td>
              <td className="border px-4 py-2">
                {r.follow_up_recommended ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
