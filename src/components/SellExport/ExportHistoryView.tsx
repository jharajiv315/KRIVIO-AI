import React, { useEffect, useState } from 'react';
import { marketplaceApi } from '../../services/api';
import { FileSpreadsheet, FileText, CheckCircle2, History, AlertCircle, RefreshCw } from 'lucide-react';

export const ExportHistoryView: React.FC = () => {
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    try {
      setLoading(true);
      const res = await marketplaceApi.getExports();
      setExports(res.exports || []);
    } catch (err) {
      console.error('Failed to load exports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 font-inter">
        <div className="w-10 h-10 border-3 border-[#0F5132] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-600 dark:text-emerald-200">
          Loading catalog export history...
        </p>
      </div>
    );
  }

  if (exports.length === 0) {
    return (
      <div className="p-10 rounded-3xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/40 text-center space-y-3 font-inter shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/20 dark:border-emerald-800 flex items-center justify-center text-[#0F5132] dark:text-emerald-400">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white">
          No export history yet
        </h3>
        <p className="text-xs text-stone-500 dark:text-emerald-300/70 max-w-sm mx-auto leading-relaxed">
          When you export catalog files for Amazon, Meesho, Flipkart, or ONDC, an audit trail will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-inter">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
          Catalog Export Audit Log ({exports.length})
        </h3>
        <button
          onClick={loadExports}
          className="text-xs text-stone-500 dark:text-emerald-400/80 hover:text-stone-800 dark:hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="border border-stone-200 dark:border-emerald-900/40 rounded-2xl overflow-x-auto bg-white dark:bg-[#13251B]">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-emerald-950/80 text-stone-700 dark:text-emerald-200 font-semibold border-b border-stone-200 dark:border-emerald-900/40">
            <tr>
              <th className="p-3">Destination</th>
              <th className="p-3">Format</th>
              <th className="p-3">Products Exported</th>
              <th className="p-3">Schema Version</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-emerald-900/30">
            {exports.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-emerald-950/30">
                <td className="p-3 font-semibold text-stone-900 dark:text-white uppercase font-poppins text-xs whitespace-nowrap">
                  {item.destination}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-emerald-950 text-stone-700 dark:text-emerald-300 font-bold uppercase">
                    .{item.format}
                  </span>
                </td>
                <td className="p-3 font-bold text-stone-900 dark:text-white whitespace-nowrap">
                  {item.product_count} items
                </td>
                <td className="p-3 font-mono text-stone-500 dark:text-emerald-300/70 text-[11px] whitespace-nowrap">
                  {item.schema_version}
                </td>
                <td className="p-3 text-stone-500 dark:text-emerald-300/70 whitespace-nowrap">
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
