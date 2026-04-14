import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { RTNavbar } from "../../common-components/index";
import { getApiWithAuth } from "../../../utils/api";
import { CALL_TRANSFERS } from "../../../utils/apiUrls";

const TIME_RANGE_OPTIONS = [
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CallTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTransfers = useCallback(async (currentPage, currentTimeRange) => {
    setLoading(true);
    try {
      const url = `${CALL_TRANSFERS}?timeRange=${currentTimeRange}&page=${currentPage}&limit=${limit}`;
      const res = await getApiWithAuth(url);
      if (res.success && res.data?.ok) {
        setTransfers(res.data.transfers || []);
        setTotal(res.data.total || 0);
      } else {
        toast.error(res.data?.message || "Failed to load transfers.");
      }
    } catch {
      toast.error("Something went wrong loading transfers.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTransfers(page, timeRange);
  }, [page, timeRange, fetchTransfers]);

  const handleTimeRangeChange = (val) => {
    setTimeRange(val);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const filtered = search.trim()
    ? transfers.filter((t) => {
        const q = search.toLowerCase();
        return (
          (t.firstname + " " + t.lastname).toLowerCase().includes(q) ||
          t.agent?.toLowerCase().includes(q) ||
          t.campaign?.toLowerCase().includes(q) ||
          String(t.phone).includes(q) ||
          t.state?.toLowerCase().includes(q) ||
          t.city?.toLowerCase().includes(q)
        );
      })
    : transfers;

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <RTNavbar />

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1d23]">Call Transfers</h1>
            <p className="mt-0.5 text-sm text-[#62748E]">
              {total > 0 ? `${total.toLocaleString()} total transfers` : "No transfers found"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search agent, name, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
              />
            </div>

            {/* Time range */}
            <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
              {TIME_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTimeRangeChange(opt.value)}
                  className={`px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    timeRange === opt.value
                      ? "bg-indigo-600 text-white"
                      : "text-[#62748E] hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f9fafb]">
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Date & Time</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Contact</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Phone</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Location</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Agent</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Campaign</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Transferred To</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Duration</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Gateway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-7 w-7 text-indigo-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span className="text-sm text-gray-400">Loading transfers…</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-sm text-gray-400">
                      No transfers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap">
                        {formatDate(t.date_time)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[13px] text-[#1a1d23]">
                          {t.firstname} {t.lastname}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{t.address}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap">
                        {t.matched_number || t.phone}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap">
                        {t.city}, {t.state} {t.zip}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#1a1d23] whitespace-nowrap">
                        {t.agent || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-[12px] font-medium text-indigo-700">
                          {t.campaign || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] max-w-[200px]">
                        <span className="block truncate" title={t.transfered_to}>
                          {t.transfered_to || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap">
                        {formatDuration(t.duration)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap">
                        GW {t.gateway}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
              <span className="text-[13px] text-[#62748E]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CallTransfers;
