import { useState, useEffect } from "react";
import { RTNavbar } from "../../common-components/index";

import { CallIcon, TimeIcon, GraphIcon, GroupIcon, CalenderIcon, ChaveronIcon } from "../../RTIcons";
import { getApiWithAuth } from "../../../utils/api";
import { STATS_API_URL, PERFORMANCE_API } from "../../../utils/apiUrls";

const PERIODS = ["Today", "15 minutes", "60 minutes"];

const MedalIcon = ({ rank }) => {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[13px] font-semibold text-gray-700">
      {rank}
    </span>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  // change,
  // changePositive,
  iconBgClass = "bg-[#f5f6fa]"
}) =>
  <div className="flex items-start justify-between rounded-xl bg-white px-6 pb-5 pt-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
    <div>
      <p className="mb-1.5 font-urbanist text-[13px] font-semibold text-[#45556C]">
        {label}
      </p>
      <p className="mb-2 text-[30px] font-bold leading-[1.1] text-[#1a1d23]">
        {value}
      </p>
      {/* <p
        className={`text-xs font-semibold ${changePositive
          ? "text-emerald-500"
          : "text-red-500"}`}
      >
        {change}{" "}
        <span className="font-[12px] text-[#62748E]">vs last period</span>
      </p> */}
    </div>
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
    >
      {icon}
    </div>
  </div>;

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AgentLeadership = () => {
  const [period, setPeriod] = useState("Today");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getApiWithAuth(STATS_API_URL);
      if (res.success) {
        setStats(res.data);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoadingAgents(true);
      const res = await getApiWithAuth(`${PERFORMANCE_API}?page=${currentPage}`);
      if (res.success && res.data?.data) {
        setAgents(res.data.data);
        setPagination(res.data.pagination);
      }
      setLoadingAgents(false);
    };
    fetchAgents();
  }, [currentPage]);

  const filtered = agents.filter(a =>
    a.caller_id?.toLowerCase().includes(search.toLowerCase()) ||
    a.platform?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = pagination?.totalPages ?? 1;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <RTNavbar />
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="font-urbanist text-[24px] font-semibold leading-[150%] text-[#1a1d23]">
            Agent Leaderboard
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
           
            <CalenderIcon width={15} height={15}/>
          
            <span className="font-medium text-gray-700">Period:</span>
            <div className="relative">
              <button
                type="button"
                className="flex h-9 w-[120px] items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300"
                onClick={() => setDropdownOpen(o => !o)}
              >
                {period}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="#374151"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>


              </button>
              {dropdownOpen &&
                <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                  {PERIODS.map(p =>
                    <button
                      key={p}
                      type="button"
                      className={`block w-full px-3.5 py-[9px] text-left text-[13px] transition-colors hover:bg-gray-50 ${p ===
                      period
                        ? "bg-indigo-50 font-semibold text-indigo-500"
                        : "text-gray-700"}`}
                      onClick={() => {
                        setPeriod(p);
                        setDropdownOpen(false);
                      }}
                    >
                      {p}
                    </button>
                  )}
                </div>}
            </div>
          </div>
        </div>

        <div className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Calls"
            value={stats ? stats.total_calls.toLocaleString() : "—"}
            change="+12.5%"
            changePositive
            iconBgClass="bg-blue-50"
            icon={<CallIcon width={28} height={28} className="text-blue-500" />}
          />
          <StatCard
            label="Distinct Agents"
            value={stats ? stats.distinct_agents.toLocaleString() : "—"}
            change="-8.2%"
            changePositive={false}
            iconBgClass="bg-emerald-50"
            icon={
              <TimeIcon width={28} height={28} className="text-emerald-500" />
            }
          />
          <StatCard
            label="Avg Calls / Agent"
            value={stats ? stats.avg_calls_per_agent.toLocaleString() : "—"}
            change="+5.1%"
            changePositive
            iconBgClass="bg-purple-50"
            icon={
              <GraphIcon width={28} height={28} className="text-purple-500" />
            }
          />
          <StatCard
            label="Active Campaigns"
            value={stats ? stats.distinct_campaigns : "—"}
            change="+2"
            changePositive
            iconBgClass="bg-orange-50"
            icon={
              <GroupIcon width={28} height={28} className="text-orange-500" />
            }
          />
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-4 pb-5 pt-6 sm:px-7 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-urbanist text-[24px] font-semibold leading-[150%] text-[#1a1d23]">
                Performance Rankings
              </h1>
              <p className="text-[14px] text-[#45556C] font-urbanist">
                {pagination
                  ? `Showing ${(currentPage - 1) * pagination.pageSize + 1}–${Math.min(currentPage * pagination.pageSize, pagination.totalCount)} of ${pagination.totalCount.toLocaleString()} records`
                  : `Showing ${filtered.length} agents`}
              </p>
            </div>
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-3"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="5"
                  stroke="#9ca3af"
                  strokeWidth="1.4"
                />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="#9ca3af"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className="h-[38px] w-full rounded-[20px] border border-gray-200 bg-gray-50 px-3.5 pl-9 text-[13px] text-[#1a1d23] outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white md:w-[220px]"
                type="text"
                placeholder="Search caller ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-16 border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    #
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Caller ID
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Platform
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Total Dials
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Connects
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Connect Rate
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Avg Talk Time
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Total Duration
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Transfers
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Transfer Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingAgents
                  ? <tr>
                      <td
                        colSpan={10}
                        className="py-16 text-center text-sm text-gray-400"
                      >
                        Loading...
                      </td>
                    </tr>
                  : filtered.length === 0
                    ? <tr>
                        <td
                          colSpan={10}
                          className="py-16 text-center text-sm text-gray-400"
                        >
                          No results found.
                        </td>
                      </tr>
                    : filtered.map((agent, idx) => {
                        const globalRank =
                          (currentPage - 1) * (pagination?.pageSize ?? 100) +
                          idx +
                          1;
                        return (
                          <tr
                            key={`${agent.caller_id}-${idx}`}
                            className="border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50/60"
                          >
                            <td className="px-4 py-4 align-middle text-sm text-[#1a1d23] sm:px-7">
                              <MedalIcon rank={globalRank} />
                            </td>
                            <td className="px-4 py-4 align-middle text-sm font-semibold text-[#1a1d23] sm:px-7">
                              {agent.caller_id}
                            </td>
                            <td className="px-4 py-4 align-middle text-sm sm:px-7">
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[12px] font-medium text-indigo-600 capitalize">
                                {agent.platform}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                              {agent.total_dials}
                            </td>
                            <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                              {agent.connects}
                            </td>
                            <td className="px-4 py-4 text-right align-middle text-sm tabular-nums sm:px-7">
                              <span
                                className={`font-semibold ${agent.connect_rate >= 0.8
                                  ? "text-emerald-600"
                                  : agent.connect_rate >= 0.5
                                    ? "text-amber-500"
                                    : "text-red-500"}`}
                              >
                                {(agent.connect_rate * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                              {formatDuration(agent.avg_talk_time)}
                            </td>
                            <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                              {formatDuration(agent.total_duration)}
                            </td>
                            <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                              {agent.transfers}
                            </td>
                            <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-gray-500 sm:px-7">
                              {(agent.transfer_rate * 100).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
              </tbody>
            </table>
          </div>

          {pagination && totalPages > 1 &&
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 sm:px-7">
              <p className="text-[13px] text-[#62748E]">
                Page {currentPage} of {totalPages.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!pagination.hasPrev}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M9 11L5 7L9 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {getPageNumbers().map((page, i) =>
                  page === "..."
                    ? <span
                        key={`ellipsis-${i}`}
                        className="flex h-8 w-8 items-center justify-center text-[13px] text-gray-400"
                      >
                        …
                      </span>
                    : <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${currentPage === page
                          ? "bg-indigo-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                      >
                        {page}
                      </button>
                )}

                <button
                  type="button"
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M5 3L9 7L5 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>}
        </div>
      </main>
    </div>
  );
};

export default AgentLeadership;
