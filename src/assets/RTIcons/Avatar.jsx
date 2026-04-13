import * as React from "react";

const Avatar = ({ name = "Chris Miguel", width = 40, height = 40 }) => {
  const getInitials = fullName => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500"
  ];

  // Simple hash to consistently pick a color based on name
  const getColorIndex = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors.length;
  };

  const bgColor = colors[getColorIndex(name)];
  const initials = getInitials(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium leading-none ${bgColor}`}
      style={{ width, height, fontSize: `${width * 0.4}px`, lineHeight: 1 }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
