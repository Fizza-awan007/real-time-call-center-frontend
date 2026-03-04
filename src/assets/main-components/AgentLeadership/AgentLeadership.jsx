import { useState } from "react";
import { RTNavbar } from "../../common-components/index";

import { CallIcon, TimeIcon, GraphIcon, GroupIcon } from "../../RTIcons";

const AGENTS = [
  {
    id: 1,
    name: "Sarah Johnson",
    label: "Agent #1",
    initials: "SJ",
    status: "Available",
    calls: 87,
    avgTime: "4:12",
    satisfaction: 4.9,
    conversion: 78.5,
    talkTime: "6h 05m"
  },
  {
    id: 2,
    name: "Michael Chen",
    label: "Agent #2",
    initials: "MC",
    status: "On Call",
    calls: 82,
    avgTime: "4:35",
    satisfaction: 4.8,
    conversion: 75.2,
    talkTime: "5h 52m"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    label: "Agent #3",
    initials: "ER",
    status: "Available",
    calls: 79,
    avgTime: "4:08",
    satisfaction: 4.9,
    conversion: 72.8,
    talkTime: "5h 28m"
  },
  {
    id: 4,
    name: "David Kim",
    label: "Agent #4",
    initials: "DK",
    status: "Available",
    calls: 76,
    avgTime: "4:45",
    satisfaction: 4.7,
    conversion: 71.5,
    talkTime: "5h 42m"
  },
  {
    id: 5,
    name: "Jessica Williams",
    label: "Agent #5",
    initials: "JW",
    status: "On Call",
    calls: 74,
    avgTime: "4:22",
    satisfaction: 4.8,
    conversion: 69.8,
    talkTime: "5h 21m"
  },
  {
    id: 6,
    name: "Robert Taylor",
    label: "Agent #6",
    initials: "RT",
    status: "Available",
    calls: 71,
    avgTime: "4:38",
    satisfaction: 4.6,
    conversion: 68.4,
    talkTime: "5h 12m"
  },
  {
    id: 7,
    name: "Amanda Martinez",
    label: "Agent #7",
    initials: "AM",
    status: "On Call",
    calls: 69,
    avgTime: "4:55",
    satisfaction: 4.7,
    conversion: 67.2,
    talkTime: "5h 38m"
  },
  {
    id: 8,
    name: "James Anderson",
    label: "Agent #8",
    initials: "JA",
    status: "On Call",
    calls: 67,
    avgTime: "4:18",
    satisfaction: 4.5,
    conversion: 65.9,
    talkTime: "4h 48m"
  }
];

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
  change,
  changePositive,
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
      <p
        className={`text-xs font-semibold ${changePositive
          ? "text-emerald-500"
          : "text-red-500"}`}
      >
        {change}{" "}
        <span className="font-[12px] text-[#62748E]">vs last period</span>
      </p>
    </div>
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
    >
      {icon}
    </div>
  </div>;

const AgentLeadership = () => {
  const [period, setPeriod] = useState("Today");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = AGENTS.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <RTNavbar />
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="font-urbanist text-[24px] font-semibold leading-[150%] text-[#1a1d23]">
            Agent Leaderboard
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="1"
                y="2"
                width="14"
                height="13"
                rx="2"
                stroke="#6b7280"
                strokeWidth="1.4"
              />
              <path
                d="M5 1v2M11 1v2M1 6h14"
                stroke="#6b7280"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-medium text-gray-700">Period:</span>
            <div className="relative">
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300"
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
                <div className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[130px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
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
            value="1,247"
            change="+12.5%"
            changePositive
            iconBgClass="bg-blue-50"
            icon={<CallIcon width={28} height={28} className="text-blue-500" />}
          />
          <StatCard
            label="Avg Handle Time"
            value="4:32"
            change="-8.2%"
            changePositive={false}
            iconBgClass="bg-emerald-50"
            icon={
              <TimeIcon width={28} height={28} className="text-emerald-500" />
            }
          />
          <StatCard
            label="Conversion Rate"
            value="68.4%"
            change="+5.1%"
            changePositive
            iconBgClass="bg-purple-50"
            icon={
              <GraphIcon width={28} height={28} className="text-purple-500" />
            }
          />
          <StatCard
            label="Active Agents"
            value="24"
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
                Showing {filtered.length} agents
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
                placeholder="Search agents..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20 border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Rank
                  </th>
                  <th className="w-[260px] border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px]text-[#45556C] font-urbanist sm:px-7">
                    Agent
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Status
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Calls
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Avg Time
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Satisfaction
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Conversion
                  </th>
                  <th className="border-b border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-[#45556C] font-urbanist sm:px-7">
                    Talk Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((agent, idx) =>
                  <tr
                    key={agent.id}
                    className="border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50/60"
                  >
                    <td className="w-20 px-4 py-4 align-middle text-sm text-[#1a1d23] sm:px-7">
                      <MedalIcon rank={idx + 1} />
                    </td>
                    <td className="w-[260px] px-4 py-4 align-middle text-sm text-[#1a1d23] sm:px-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                          {agent.initials}
                        </div>
                        <div>
                          <p className="mb-px text-sm font-semibold text-[#1a1d23]">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {agent.label}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-[#1a1d23] sm:px-7">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5C6E91]">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${agent.status ===
                          "Available"
                            ? "bg-emerald-500"
                            : "bg-orange-500"}`}
                        />
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                      {agent.calls}
                    </td>
                    <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                      {agent.avgTime}
                    </td>
                    <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                      {agent.satisfaction}
                      <span className="text-[11px] font-normal text-gray-400">
                        /5
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-[#1a1d23] sm:px-7">
                      {agent.conversion}%
                    </td>
                    <td className="px-4 py-4 text-right align-middle text-sm tabular-nums text-gray-500 sm:px-7">
                      {agent.talkTime}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentLeadership;
