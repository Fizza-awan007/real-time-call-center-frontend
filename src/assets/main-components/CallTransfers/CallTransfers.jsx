import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { RTNavbar } from "../../common-components/index";
import ClockPicker from "../../common-components/ClockPicker";
import { CalenderIcon } from "../../RTIcons";
import { getApiWithAuth } from "../../../utils/api";
import { CALL_TRANSFERS } from "../../../utils/apiUrls";

const TIME_RANGE_OPTIONS = [
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
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

const toUtcIsoString = (date, time, isEndOfDay = false) => {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time ? time.split(":").map(Number) : [];
  const second = isEndOfDay ? 59 : 0;
  const millisecond = isEndOfDay ? 999 : 0;
  const pad = (v) => String(v).padStart(2, "0");
  return `${year}-${pad(month || 1)}-${pad(day || 1)}T${pad(hour)}:${pad(minute)}:${pad(second)}.${String(millisecond).padStart(3, "0")}Z`;
};

const formatTime12 = (time24) => {
  if (!time24) return null;
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const CallTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 100;

  // Time range (preset)
  const [timeRange, setTimeRange] = useState(TIME_RANGE_OPTIONS[0]); // default 24h

  // Custom date + time
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [clockOpen, setClockOpen] = useState(null); // "start" | "end" | null

  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const fetchTransfers = useCallback(
    async (currentPage, from, fromTime, to, toTime, range) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit });

        if (from) {
          params.set("dateFrom", toUtcIsoString(from, fromTime, false));
          params.set("dateTo", toUtcIsoString(to || from, toTime || "23:59", true));
        } else if (range) {
          params.set("timeRange", range.value);
        }

        const url = `${CALL_TRANSFERS}?${params.toString()}`;
        const res = await getApiWithAuth(url, controller.signal);
        if (res.cancelled) return;
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
    },
    [limit]
  );

  useEffect(() => {
    const id = setTimeout(() => {
      fetchTransfers(page, dateFrom, startTime, dateTo, endTime, timeRange);
    }, 300);
    return () => {
      clearTimeout(id);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [page, dateFrom, dateTo, startTime, endTime, timeRange, fetchTransfers]);

  const handleTimeRangeChange = (opt) => {
    setTimeRange(opt);
    setDateFrom("");
    setDateTo("");
    setStartTime("");
    setEndTime("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <RTNavbar />

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="mb-4 flex flex-col gap-1">
            <h1 className="text-[22px] font-bold text-[#1a1d23]">Call Transfers</h1>
            <p className="text-sm text-[#62748E]">
              {total > 0 ? `${total.toLocaleString()} total transfers` : "No transfers found"}
            </p>
          </div>

          {/* Filters row */}
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between xl:gap-4">
            {/* Date + Time pickers */}
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-3">
              {/* From */}
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                <label htmlFor="date-from" className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
                  From
                </label>
                <div className="flex w-full flex-col gap-1.5 min-[400px]:flex-row min-[400px]:items-center">
                  <input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                      if (e.target.value) setTimeRange(null);
                    }}
                    className="h-[38px] w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2.5 text-[13px] text-[#1a1d23] outline-none transition-colors focus:border-indigo-500 min-[400px]:w-auto min-[400px]:px-3"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setClockOpen(clockOpen === "start" ? null : "start")}
                      className="flex h-[38px] w-full min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-[#1a1d23] transition-colors hover:border-indigo-400 min-[400px]:w-auto"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className={startTime ? "text-[#1a1d23]" : "text-gray-400"}>
                        {formatTime12(startTime) || "Start time"}
                      </span>
                    </button>
                    {clockOpen === "start" && (
                      <ClockPicker
                        label="SELECT START TIME"
                        value={startTime}
                        onConfirm={(val) => {
                          setStartTime(val);
                          if (dateFrom) setTimeRange(null);
                          setPage(1);
                          setClockOpen(null);
                        }}
                        onCancel={() => setClockOpen(null)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* To */}
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                <label htmlFor="date-to" className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
                  To
                </label>
                <div className="flex w-full flex-col gap-1.5 min-[400px]:flex-row min-[400px]:items-center">
                  <input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                      if (e.target.value) setTimeRange(null);
                    }}
                    className="h-[38px] w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2.5 text-[13px] text-[#1a1d23] outline-none transition-colors focus:border-indigo-500 min-[400px]:w-auto min-[400px]:px-3"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setClockOpen(clockOpen === "end" ? null : "end")}
                      className="flex h-[38px] w-full min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-[#1a1d23] transition-colors hover:border-indigo-400 min-[400px]:w-auto"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className={endTime ? "text-[#1a1d23]" : "text-gray-400"}>
                        {formatTime12(endTime) || "End time"}
                      </span>
                    </button>
                    {clockOpen === "end" && (
                      <ClockPicker
                        label="SELECT END TIME"
                        value={endTime}
                        onConfirm={(val) => {
                          setEndTime(val);
                          if (dateFrom) setTimeRange(null);
                          setPage(1);
                          setClockOpen(null);
                        }}
                        onCancel={() => setClockOpen(null)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Time range preset buttons */}
            <div className="flex items-center gap-2 text-[13px] text-gray-500">
              <CalenderIcon width={15} height={15} />
              <span className="font-medium text-gray-700 whitespace-nowrap">Period:</span>
              <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleTimeRangeChange(opt)}
                    className={`px-3.5 py-2 text-[13px] font-medium transition-colors ${
                      timeRange?.value === opt.value
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
        </div>

        {/* Table Card */}
        <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2000px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f9fafb]">
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Date & Time</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Contact</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Phone</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Dialed</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Location</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Agent</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Agent ID</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-center text-[#62748E]">Campaign</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Transferred To</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Duration</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">DID</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Gateway</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Platform</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Client ID</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#62748E]">Pool Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={15} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-7 w-7 text-indigo-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span className="text-sm text-gray-400">Loading transfers…</span>
                      </div>
                    </td>
                  </tr>
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-16 text-center text-sm text-gray-400">
                      No transfers found.
                    </td>
                  </tr>
                ) : (
                  transfers.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap text-center">
                        {formatDate(t.date_time)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <div className="font-medium text-[13px] text-[#1a1d23]">
                          {t.firstname} {t.lastname}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5 text-center">{t.address}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap text-center">
                        {t.matched_number || t.phone || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap text-center">
                        {t.dialed || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap text-center">
                        {t.city}, {t.state} {t.zip}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#1a1d23] whitespace-nowrap text-center">
                        {t.agent || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap text-center">
                        {t.agentid || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#62748E] whitespace-nowrap text-center">
                        {t.campaign || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-center text-[#62748E]" style={{ minWidth: "200px" }}>
                        <span className="block truncate" title={t.transfered_to}>
                          {t.transfered_to || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-center text-[#62748E] whitespace-nowrap">
                        {formatDuration(t.duration)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-center text-[#62748E] whitespace-nowrap">
                        {t.did || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-center text-[#62748E] whitespace-nowrap">
                        {t.gateway || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-center text-[#62748E] whitespace-nowrap capitalize">
                        {t.platform || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-center text-[#62748E] whitespace-nowrap">
                        {t.client_id || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-center text-[#62748E]" style={{ minWidth: "180px" }}>
                        <span className="block truncate" title={t.pool_name}>
                          {t.pool_name || "—"}
                        </span>
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
