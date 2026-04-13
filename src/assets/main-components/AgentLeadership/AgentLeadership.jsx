import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { RTNavbar } from "../../common-components/index";
import ClockPicker from "../../common-components/ClockPicker";

import {
  CallIcon,
  TimeIcon,
  GraphIcon,
  GroupIcon,
  CalenderIcon,
  ChaveronIcon
} from "../../RTIcons";
import { getApiWithAuth } from "../../../utils/api";
import {
  POOL_DASHBOARD_SUMMARY,
  POOL_DASHBOARD_LIST,
  CALLTOOLS_SUMMARY,
  CALLS_LIST
} from "../../../utils/apiUrls";

const PERIOD_OPTIONS = [
  { label: "24 hours", value: "24h" },
  { label: "15 minutes", value: "15m" },
  { label: "60 minutes", value: "1h" },
  { label: "7 days", value: "7d" }
  // { label: "30 days", value: "30d" }
];

const CALLTOOLS_PERIOD_OPTIONS = [
  { label: "24 hours", value: "24h" },
  { label: "15 minutes", value: "15m" },
  { label: "60 minutes", value: "1h" },
  { label: "7 days", value: "7d" }
];

const GATEWAY_OPTIONS = [
  { label: "Gateway 1", value: "gateway-1", code: "100" },
  { label: "Gateway 2", value: "gateway-2", code: "200" },
  { label: "Gateway 3", value: "gateway-3", code: "300" },
  { label: "All Gateways", value: "all-gateways", code: null },
  { label: "Call Tools", value: "call-tools", code: null }
];

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
}) => (
  <div className="flex items-start justify-between rounded-xl bg-white px-6 pb-5 pt-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
    <div>
      <p className="mb-1.5 font-urbanist text-[13px] font-semibold text-[#45556C]">
        {label}
      </p>
      <p className="mb-2 text-[22px] font-bold leading-[1.1] text-[#1a1d23] sm:text-[30px]">
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
  </div>
);

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatSecondsValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toFixed(2);
};

const formatPercentValue = (value, allowRatio = false) => {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  const percent = allowRatio && numeric <= 1 ? numeric * 100 : numeric;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
};

const toUtcIsoString = (date, time, isEndOfDay = false) => {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time ? time.split(":").map(Number) : [];
  const second = isEndOfDay ? 59 : 0;
  const millisecond = isEndOfDay ? 999 : 0;

  const pad = (value) => String(value).padStart(2, "0");

  return `${year}-${pad(month || 1)}-${pad(day || 1)}T${pad(
    hour
  )}:${pad(minute)}:${pad(second)}.${String(millisecond).padStart(3, "0")}Z`;
};

const normalizeSummary = (data, isCallTools) => {
  if (!data) return null;

  if (isCallTools) {
    return {
      totalDials: data.total_dials ?? 0,
      totalConnected: data.connects ?? 0,
      totalQualityConnected: data.quality_connects ?? 0,
      totalTransfers: data.transfers ?? 0,
      transferRate: data.transfer_rate ?? 0,
      averageDuration: data.avg_duration ?? 0
    };
  }

  // handles both /api/calls summary and /api/pool-dashboard/summary
  return {
    totalDials: data.total_dials ?? 0,
    totalConnected: data.connects ?? 0,
    totalQualityConnected: null,
    totalTransfers: data.transfers ?? null,
    transferRate: data.connect_rate ?? 0,
    averageDuration: data.avg_duration ?? 0
  };
};

const GROUP_BY_OPTIONS = [
  { label: "DID", value: "did" },
  { label: "Campaign", value: "campaign" }
];

const AgentLeadership = () => {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);
  const [gateway, setGateway] = useState(GATEWAY_OPTIONS[3]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [gatewayDropdownOpen, setGatewayDropdownOpen] = useState(false);
  const [groupBy, setGroupBy] = useState(GROUP_BY_OPTIONS[0]);
  const [groupByDropdownOpen, setGroupByDropdownOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [clockOpen, setClockOpen] = useState(null); // "start" | "end" | null

  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const statsAbortRef = useRef(null);
  const agentsAbortRef = useRef(null);
  const gatewayValue = gateway?.value;
  const periodValue = period?.value;
  const groupByValue = groupBy?.value;
  const isCallTools = gatewayValue === "call-tools";
  const isCallsApi = gatewayValue === "all-gateways" || gatewayValue === "gateway-1" || gatewayValue === "gateway-2" || gatewayValue === "gateway-3";
  const visiblePeriodOptions = isCallTools ? CALLTOOLS_PERIOD_OPTIONS : PERIOD_OPTIONS;

  useEffect(() => {
    if (periodValue === "24h") {
      setPeriod(PERIOD_OPTIONS[0]);
    }
  }, [gatewayValue, periodValue]);

  useEffect(() => {
    if (!period && !dateFrom) return;

    const timeoutId = setTimeout(() => {
      // Cancel previous stats request
      if (statsAbortRef.current) statsAbortRef.current.abort();
      const controller = new AbortController();
      statsAbortRef.current = controller;

      const fetchStats = async () => {
        const params = new URLSearchParams();
        setStats(null);
        if (dateFrom) {
          const finalDateFrom = toUtcIsoString(dateFrom, startTime, false);
          const finalDateTo = toUtcIsoString(
            dateTo || dateFrom,
            endTime || "23:59",
            true
          );
          params.set("dateFrom", finalDateFrom);
          params.set("dateTo", finalDateTo);
        } else {
          params.set("window", periodValue);
        }

        if (isCallsApi || isCallTools) {
          // The summary for isCallsApi and isCallTools is fetched simultaneously with the agents list
          // in the second useEffect hook to avoid making duplicate API calls.
          return;
        }

        const res = await getApiWithAuth(
          `${isCallTools ? CALLTOOLS_SUMMARY : POOL_DASHBOARD_SUMMARY}?${params.toString()}`,
          controller.signal
        );

        if (res.cancelled) return;

        if (res.success && (res.data?.summary || res.data?.ok)) {
          setStats(normalizeSummary(res.data?.summary || res.data, isCallTools));
        } else if (!res.success && !res.redirecting) {
          toast.error(
            res.data?.error || res.data?.message || "Failed to load summary."
          );
        }
      };
      fetchStats();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (statsAbortRef.current) statsAbortRef.current.abort();
    };
  }, [period, dateFrom, dateTo, startTime, endTime, gateway, isCallTools, isCallsApi, periodValue, groupByValue]);

  useEffect(() => {
    if (!period && !dateFrom) return;

    const timeoutId = setTimeout(() => {
      // Cancel previous agents request
      if (agentsAbortRef.current) agentsAbortRef.current.abort();
      const controller = new AbortController();
      agentsAbortRef.current = controller;

      const fetchAgents = async () => {
        setLoadingAgents(true);

        try {
          const params = new URLSearchParams({
            page: String(currentPage),
            limit: "50"
          });

          if (dateFrom) {
            const finalDateFrom = toUtcIsoString(dateFrom, startTime, false);
            const finalDateTo = toUtcIsoString(
              dateTo || dateFrom,
              endTime || "23:59",
              true
            );
            params.set("dateFrom", finalDateFrom);
            params.set("dateTo", finalDateTo);
          } else {
            params.set("window", periodValue);
          }

          if (isCallTools) {
            params.set("filter", groupByValue);
            const res = await getApiWithAuth(
              `${CALLTOOLS_SUMMARY}?${params.toString()}`,
              controller.signal
            );
            if (res.cancelled) return;
            if (res.success && (res.data?.summary || res.data?.ok)) {
              // Handle nested response structure for DID/Campaign filters
              const filterData = res.data?.[groupByValue];
              const rawAgents = filterData?.data ?? [];

              // Map 'did' or 'campaign' field to 'pool_name' for table display
              const mappedAgents = rawAgents.map(agent => {
                let displayName = agent.pool_name;

                if (groupByValue === "did") {
                  displayName = agent.did || "Unknown DID";
                } else if (groupByValue === "campaign") {
                  displayName = agent.campaign !== null && agent.campaign !== undefined
                    ? String(agent.campaign)
                    : "Unknown Campaign";
                }

                return {
                  ...agent,
                  pool_name: displayName
                };
              });

              setAgents(mappedAgents);
              setPagination(filterData ? {
                totalCount: filterData.total,
                pageSize: filterData.limit,
                totalPages: filterData.totalPages ?? Math.ceil(filterData.total / filterData.limit),
                hasPrev: filterData.page > 1,
                hasNext: filterData.page < (filterData.totalPages ?? Math.ceil(filterData.total / filterData.limit))
              } : null);
              setStats(normalizeSummary(res.data?.summary || res.data, true));
            } else if (!res.success && !res.redirecting) {
              toast.error(res.data?.error || res.data?.message || "Failed to load call tools data.");
            }
            return;
          }

          if (isCallsApi) {
            const gatewayCode = gateway?.code;
            if (gatewayCode) params.set("gateway", gatewayCode);

            const res = await getApiWithAuth(
              `${CALLS_LIST}?${params.toString()}`,
              controller.signal
            );
            if (res.cancelled) return;
            if (res.success && res.data?.data) {
              setAgents(res.data.data);
              setPagination({
                totalCount: res.data.total,
                pageSize: res.data.limit,
                totalPages: Math.ceil(res.data.total / res.data.limit),
                hasPrev: res.data.page > 1,
                hasNext: res.data.page < Math.ceil(res.data.total / res.data.limit)
              });
              
              if (res.data?.ok || res.data?.summary) {
                setStats(normalizeSummary(res.data.summary, false));
              }
            } else if (!res.success && !res.redirecting) {
              toast.error(res.data?.error || res.data?.message || "Failed to load calls data.");
            }
            return;
          }

          const res = await getApiWithAuth(
            `${POOL_DASHBOARD_LIST}?${params.toString()}`,
            controller.signal
          );

          if (res.cancelled) return;

          if (res.success && res.data?.data) {
            setAgents(res.data.data);
            setPagination({
              totalCount: res.data.total,
              pageSize: res.data.limit,
              totalPages: Math.ceil(res.data.total / res.data.limit),
              hasPrev: res.data.page > 1,
              hasNext: res.data.page < Math.ceil(res.data.total / res.data.limit)
            });
          } else if (!res.success && !res.redirecting) {
            toast.error(
              res.data?.error ||
                res.data?.message ||
                "Failed to load dashboard data."
            );
          }
        } finally {
          if (!controller.signal.aborted) setLoadingAgents(false);
        }
      };
      fetchAgents();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (agentsAbortRef.current) agentsAbortRef.current.abort();
    };
  }, [currentPage, dateFrom, dateTo, startTime, endTime, period, periodValue, gateway, isCallsApi, isCallTools, groupByValue]);

  const filtered = agents.filter(
    (a) =>
      a.pool_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.platform?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = pagination?.totalPages ?? 1;

  const statsCards = isCallTools
    ? [
        {
          label: "Total Dials",
          value: stats?.totalDials ?? "—",
          iconBgClass: "bg-blue-50",
          icon: <CallIcon width={28} height={28} className="text-blue-500" />
        },
        {
          label: "Total Connected",
          value: stats?.totalConnected ?? "—",
          iconBgClass: "bg-emerald-50",
          icon: <TimeIcon width={28} height={28} className="text-emerald-500" />
        },
        {
          label: "Total Quality Connected",
          value: stats?.totalQualityConnected ?? "—",
          iconBgClass: "bg-purple-50",
          icon: <GraphIcon width={28} height={28} className="text-purple-500" />
        },
        {
          label: "Total Transfers",
          value: stats?.totalTransfers ?? "—",
          iconBgClass: "bg-orange-50",
          icon: <GroupIcon width={28} height={28} className="text-orange-500" />
        },
        {
          label: "Transfer Rate",
          value: formatPercentValue(stats?.transferRate, true),
          iconBgClass: "bg-amber-50",
          icon: <CalenderIcon width={28} height={28} className="text-amber-500" />
        },
        {
          label: "Average Duration (sec)",
          value: formatSecondsValue(stats?.averageDuration),
          iconBgClass: "bg-sky-50",
          icon: <ChaveronIcon width={28} height={28} className="text-sky-500" />
        }
      ]
    : isCallsApi
    ? [
        {
          label: "Total Dials",
          value: stats?.totalDials ?? "—",
          iconBgClass: "bg-blue-50",
          icon: <CallIcon width={28} height={28} className="text-blue-500" />
        },
        {
          label: "Connects",
          value: stats?.totalConnected ?? "—",
          iconBgClass: "bg-emerald-50",
          icon: <TimeIcon width={28} height={28} className="text-emerald-500" />
        },
        {
          label: "Transfers",
          value: stats?.totalTransfers ?? "—",
          iconBgClass: "bg-orange-50",
          icon: <GroupIcon width={28} height={28} className="text-orange-500" />
        },
        {
          label: "Connect Rate",
          value: formatPercentValue(stats?.transferRate, true),
          iconBgClass: "bg-purple-50",
          icon: <GraphIcon width={28} height={28} className="text-purple-500" />
        },
        {
          label: "Avg Duration (sec)",
          value: formatSecondsValue(stats?.averageDuration),
          iconBgClass: "bg-sky-50",
          icon: <ChaveronIcon width={28} height={28} className="text-sky-500" />
        }
      ]
    : [
        {
          label: "Total Dials",
          value: stats?.totalDials ?? "—",
          iconBgClass: "bg-blue-50",
          icon: <CallIcon width={28} height={28} className="text-blue-500" />
        },
        {
          label: "Connects",
          value: stats?.totalConnected ?? "—",
          iconBgClass: "bg-emerald-50",
          icon: <TimeIcon width={28} height={28} className="text-emerald-500" />
        },
        {
          label: "Connect Rate",
          value: formatPercentValue(stats?.transferRate, true),
          iconBgClass: "bg-purple-50",
          icon: <GraphIcon width={28} height={28} className="text-purple-500" />
        },
        {
          label: "Avg Duration (sec)",
          value: formatSecondsValue(stats?.averageDuration),
          iconBgClass: "bg-orange-50",
          icon: <GroupIcon width={28} height={28} className="text-orange-500" />
        }
      ];

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
          <h1 className="font-urbanist text-[18px] font-semibold leading-[150%] text-[#1a1d23] sm:text-[24px]">
            Agent Leaderboard
          </h1>
        </div>

        <div className={`mb-7 grid gap-5 sm:grid-cols-2 ${isCallTools ? "xl:grid-cols-3" : isCallsApi ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
          {statsCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              iconBgClass={card.iconBgClass}
              icon={card.icon}
            />
          ))}
        </div>

        <div className="rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="border-b border-gray-100 px-4 pb-5 pt-6 sm:px-7">
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4 xl:flex-nowrap">
                <h1 className="whitespace-nowrap font-urbanist text-[18px] font-semibold leading-[150%] text-[#1a1d23] sm:text-[24px]">
                  Performance Rankings
                </h1>

                <div className="relative flex w-full items-center md:w-auto">
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
                    className="h-[38px] w-full rounded-[20px] border border-gray-200 bg-gray-50 px-3.5 pl-9 text-[13px] text-[#1a1d23] outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white md:w-[180px] lg:w-[240px]"
                    type="text"
                    placeholder="Search pool name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between xl:gap-4">
                <div className="flex flex-col gap-3 md:order-2 md:flex-row md:flex-wrap md:items-center md:gap-3 xl:order-1">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                  <label
                    htmlFor="date-from"
                    className="text-[13px] font-medium text-gray-700"
                  >
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
                        setCurrentPage(1);
                        if (e.target.value) setPeriod(null);
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
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className={startTime ? "text-[#1a1d23]" : "text-gray-400"}>
                          {startTime ? (() => { const [h, m] = startTime.split(":").map(Number); const ampm = h >= 12 ? "PM" : "AM"; const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`; })() : "Start time"}
                        </span>
                      </button>
                      {clockOpen === "start" && (
                        <ClockPicker
                          label="SELECT START TIME"
                          value={startTime}
                          onConfirm={(val) => {
                            setStartTime(val);
                            if (dateFrom) setPeriod(null);
                            setCurrentPage(1);
                            setClockOpen(null);
                          }}
                          onCancel={() => setClockOpen(null)}
                        />
                      )}
                    </div>
                  </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                  <label
                    htmlFor="date-to"
                    className="text-[13px] font-medium text-gray-700"
                  >
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
                        setCurrentPage(1);
                        if (e.target.value) setPeriod(null);
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
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className={endTime ? "text-[#1a1d23]" : "text-gray-400"}>
                          {endTime ? (() => { const [h, m] = endTime.split(":").map(Number); const ampm = h >= 12 ? "PM" : "AM"; const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`; })() : "End time"}
                        </span>
                      </button>
                      {clockOpen === "end" && (
                        <ClockPicker
                          label="SELECT END TIME"
                          value={endTime}
                          onConfirm={(val) => {
                            setEndTime(val);
                            if (dateFrom) setPeriod(null);
                            setCurrentPage(1);
                            setClockOpen(null);
                          }}
                          onCancel={() => setClockOpen(null)}
                        />
                      )}
                    </div>
                  </div>
                </div>
                </div>

                <div className="flex flex-col gap-3 md:order-1 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-4 xl:order-2">
                  <div className="flex min-w-0 flex-none items-center gap-2 text-[13px] text-gray-500 md:justify-end">
                    <CalenderIcon width={15} height={15} />
                    <span className="font-medium text-gray-700">Period:</span>
                    <div className="relative">
                      <button
                        type="button"
                        className="flex h-9 w-[140px] items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 sm:w-[140px]"
                        onClick={() => setDropdownOpen((o) => !o)}
                      >
                        {period ? period.label : "Period"}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke="#374151"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {dropdownOpen && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                          {visiblePeriodOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`block w-full px-3.5 py-[9px] text-left text-[13px] transition-colors hover:bg-gray-50 ${
                                period && option.value === period.value
                                  ? "bg-indigo-50 font-semibold text-indigo-500"
                                  : "text-gray-700"
                              }`}
                              onClick={() => {
                                setPeriod(option);
                                setCurrentPage(1);
                                setDateFrom("");
                                setDateTo("");
                                setStartTime("");
                                setEndTime("");
                                setDropdownOpen(false);
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-none items-center gap-2 text-[13px] text-gray-500 md:justify-end md:ml-0">
                    <span className="font-medium text-gray-700">Gateway:</span>
                    <div className="relative">
                      <button
                        type="button"
                        className="flex h-9 w-[140px] items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 sm:w-[140px]"
                        onClick={() => setGatewayDropdownOpen((o) => !o)}
                      >
                        {gateway ? gateway.label : "Gateway"}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke="#374151"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {gatewayDropdownOpen && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                          {GATEWAY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`block w-full px-3.5 py-[9px] text-left text-[13px] transition-colors hover:bg-gray-50 ${
                                gateway && option.value === gateway.value
                                  ? "bg-indigo-50 font-semibold text-indigo-500"
                                  : "text-gray-700"
                              }`}
                              onClick={() => {
                                setGateway(option);
                                setCurrentPage(1);
                                setGatewayDropdownOpen(false);
                                setDropdownOpen(false);
                                if (option.value !== "call-tools" && periodValue === "24h") {
                                  setPeriod(PERIOD_OPTIONS[0]);
                                }
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-none items-center gap-2 text-[13px] text-gray-500 md:justify-end md:ml-0">
                    <span className={`font-medium ${isCallTools ? "text-gray-700" : "text-gray-400"}`}>Group By:</span>
                    <div className="relative">
                      <button
                        type="button"
                        disabled={!isCallTools}
                        className={`flex h-9 w-[140px] items-center justify-between gap-1.5 rounded-lg border px-3.5 text-[13px] font-medium transition-colors sm:w-[140px] ${
                          isCallTools
                            ? "border-gray-200 bg-white text-gray-700 hover:border-gray-300 cursor-pointer"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => isCallTools && setGroupByDropdownOpen((o) => !o)}
                      >
                        {groupBy ? groupBy.label : "Group By"}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke={isCallTools ? "#374151" : "#9ca3af"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {groupByDropdownOpen && isCallTools && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                          {GROUP_BY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`block w-full px-3.5 py-[9px] text-left text-[13px] transition-colors hover:bg-gray-50 ${
                                groupBy && option.value === groupBy.value
                                  ? "bg-indigo-50 font-semibold text-indigo-500"
                                  : "text-gray-700"
                              }`}
                              onClick={() => {
                                setGroupBy(option);
                                setCurrentPage(1);
                                setGroupByDropdownOpen(false);
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-b-xl">
            <table className="min-w-[1080px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-16 border-b border-gray-100 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    #
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    {isCallTools
                      ? groupByValue === "campaign"
                        ? "Group By Campaign"
                        : "Group By DID"
                      : "Pool Name"}
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Platform
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Transfers
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Transfer Rate
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Total Dials
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Connects
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Connect Rate
                  </th>
                  <th className="border-b border-gray-100 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Avg Duration
                  </th>

                  {/* <th className="border-b border-gray-100 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Total Duration
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {loadingAgents ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      No results found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((agent, idx) => {
                    const globalRank =
                      (currentPage - 1) * (pagination?.pageSize ?? 100) +
                      idx +
                      1;
                    return (
                      <tr
                        key={agent._id ?? `${agent.pool_name ?? "agent"}-${idx}`}
                        className="border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50/60"
                      >
                        <td className="px-4 py-4 align-middle text-sm text-[#1a1d23] sm:px-7">
                          <MedalIcon rank={globalRank} />
                        </td>
                        <td className="px-4 py-4 align-middle text-sm font-semibold text-[#1a1d23] sm:px-7">
                          {agent.pool_name}
                        </td>
                        <td className="px-4 py-4 align-middle text-sm sm:px-7">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[12px] font-medium text-indigo-600 capitalize">
                            Readymode
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                          {agent.transfers}
                        </td>
                        <td className="px-4 py-4 text-center align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                          {agent.transfer_rate?.toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 text-center align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                          {agent.total_dials?.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                          {agent.connects?.toLocaleString()}
                        </td>
                        {/* <td className="px-4 py-4 text-center align-middle text-sm tabular-nums sm:px-7">
                              <span
                                className={`font-semibold ${agent.connect_rate >= 80
                                  ? "text-emerald-600"
                                  : agent.connect_rate >= 50
                                    ? "text-amber-500"
                                    : "text-red-500"}`}
                              >
                                {agent.connect_rate?.toFixed(1)}%
                              </span>
                            </td> */}

                        <td className="px-4 py-4 text-center align-middle text-sm tabular-nums sm:px-7">
                          <span
                            className={`font-semibold ${
                              agent.connect_rate >= 80
                                ? "text-emerald-600"
                                : agent.connect_rate >= 50
                                  ? "text-amber-500"
                                  : "text-red-500"
                            }`}
                          >
                            {agent.connect_rate === 100
                              ? "100"
                              : agent.connect_rate?.toFixed(2)}
                            %
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                          {formatDuration(agent.avg_duration)}
                        </td>
                        {/* <td className="px-4 py-4 text-center align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                              {formatDuration(agent.total_duration)}
                            </td> */}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination && totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-4 py-4 sm:flex-row sm:gap-0 sm:px-7">
              <p className="text-[13px] text-[#62748E]">
                Page {currentPage} of {totalPages.toLocaleString()}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  type="button"
                  disabled={!pagination.hasPrev}
                  onClick={() => setCurrentPage((p) => p - 1)}
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
                  page === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="flex h-8 w-8 items-center justify-center text-[13px] text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                        currentPage === page
                          ? "bg-indigo-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage((p) => p + 1)}
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
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default AgentLeadership;
