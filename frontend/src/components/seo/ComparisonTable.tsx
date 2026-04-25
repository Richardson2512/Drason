import React from 'react';

export interface ComparisonTableData {
 caption?: string;
 headers: string[];
 rows: string[][];
}

/**
 * Structured comparison/spec table. LLMs and answer engines preferentially
 * cite structured blocks over prose; use for feature matrices, provider
 * comparisons, threshold specs.
 */
export default function ComparisonTable({ data }: { data: ComparisonTableData }) {
 if (!data?.rows?.length) return null;
 return (
 <div className="not-prose my-10 overflow-x-auto border border-gray-200">
 <table className="w-full text-left text-[15px]">
 {data.caption && (
 <caption className="px-6 py-3 text-sm text-gray-500 text-left bg-gray-50 border-b border-gray-200">
 {data.caption}
 </caption>
 )}
 <thead className="bg-gray-50">
 <tr>
 {data.headers.map((h, i) => (
 <th key={i} className="px-5 py-3 font-semibold text-gray-900 border-b border-gray-200">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="bg-white">
 {data.rows.map((row, i) => (
 <tr key={i} className="border-b border-gray-100 last:border-0">
 {row.map((cell, j) => (
 <td key={j} className="px-5 py-4 text-gray-700 align-top">
 {cell}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}
