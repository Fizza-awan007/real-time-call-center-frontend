import { useState, useRef, useEffect } from "react";

const ClockPicker = ({ value, onConfirm, onCancel, label }) => {
  const parse = (v) => {
    if (!v) return { h: 12, m: 0, ampm: "AM" };
    const [hh, mm] = v.split(":").map(Number);
    const ampm = hh < 12 ? "AM" : "PM";
    const h = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
    return { h, m: mm, ampm };
  };

  const init = parse(value);
  const [hour, setHour] = useState(init.h);
  const [minute, setMinute] = useState(init.m);
  const [ampm, setAmpm] = useState(init.ampm);
  const [selecting, setSelecting] = useState("hour");

  const clockRef = useRef(null);
  const containerRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 768
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const SIZE = windowWidth <= 425 ? 155 : 185;
  const CX = SIZE / 2;
  const R = SIZE / 2 - 13;
  const HAND_R = R - 8;

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onCancel]);

  const angleFor = (val, total) =>
    ((val / total) * 360 - 90) * (Math.PI / 180);

  const currentAngle =
    selecting === "hour"
      ? angleFor(hour === 12 ? 0 : hour, 12)
      : angleFor(minute, 60);

  const handX = CX + HAND_R * Math.cos(currentAngle);
  const handY = CX + HAND_R * Math.sin(currentAngle);

  const handleClockInteraction = (e) => {
    const rect = clockRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - CX;
    const y = clientY - rect.top - CX;
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const normalized = ((angle % 360) + 360) % 360;

    if (selecting === "hour") {
      const h = Math.round(normalized / 30) % 12 || 12;
      setHour(h);
    } else {
      const m = Math.round(normalized / 6) % 60;
      setMinute(m);
    }
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    handleClockInteraction(e);
    const move = (ev) => handleClockInteraction(ev);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      if (selecting === "hour") setSelecting("minute");
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const handleTouchStart = (e) => {
    handleClockInteraction(e);
    const move = (ev) => handleClockInteraction(ev);
    const end = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      if (selecting === "hour") setSelecting("minute");
    };
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", end);
  };

  const handleConfirm = () => {
    let h24 = hour;
    if (ampm === "AM" && hour === 12) h24 = 0;
    else if (ampm === "PM" && hour !== 12) h24 = hour + 12;
    onConfirm(
      `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );
  };

  const nr = R - 2;
  const hourNumbers = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const a = angleFor(num === 12 ? 0 : num, 12);
    return { num, label: num, x: CX + nr * Math.cos(a), y: CX + nr * Math.sin(a) };
  });

  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
    (m, i) => {
      const a = angleFor(m, 60);
      return { num: m, label: i === 0 ? "00" : String(m), x: CX + nr * Math.cos(a), y: CX + nr * Math.sin(a) };
    }
  );

  const displayNumbers = selecting === "hour" ? hourNumbers : minuteNumbers;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 z-50 mt-1 rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden select-none"
      style={{ width: SIZE + 60 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-[#6c63ff] px-3 pt-3 pb-2">
        {label && (
          <p className="text-[9px] font-semibold uppercase tracking-widest text-purple-200 mb-1">
            {label}
          </p>
        )}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setSelecting("hour")}
            className={`text-[32px] font-bold leading-none rounded px-1 transition-opacity ${
              selecting === "hour" ? "text-white bg-white/20" : "text-purple-300"
            }`}
          >
            {String(hour).padStart(2, "0")}
          </button>
          <span className="text-[32px] font-bold text-white leading-none">:</span>
          <button
            type="button"
            onClick={() => setSelecting("minute")}
            className={`text-[32px] font-bold leading-none rounded px-1 transition-opacity ${
              selecting === "minute" ? "text-white bg-white/20" : "text-purple-300"
            }`}
          >
            {String(minute).padStart(2, "0")}
          </button>
          <div className="ml-2 flex flex-col gap-0.5">
            {["AM", "PM"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmpm(p)}
                className={`text-[11px] font-semibold leading-none transition-colors ${
                  ampm === p ? "text-white" : "text-purple-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clock face */}
      <div className="flex justify-center py-3 px-2">
        <div
          ref={clockRef}
          className="relative cursor-pointer rounded-full bg-gray-100"
          style={{ width: SIZE, height: SIZE }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <svg
            width={SIZE}
            height={SIZE}
            className="absolute inset-0"
            style={{ pointerEvents: "none" }}
          >
            <circle cx={CX} cy={CX} r={3} fill="#6c63ff" />
            <line
              x1={CX} y1={CX} x2={handX} y2={handY}
              stroke="#6c63ff" strokeWidth={1.5}
            />
            <circle cx={handX} cy={handY} r={13} fill="#6c63ff" />
          </svg>

          {displayNumbers.map(({ num, label, x, y }) => {
            const isActive = selecting === "hour" ? num === hour : num === minute;
            return (
              <span
                key={num}
                className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-medium ${
                  isActive ? "text-white" : "text-gray-700"
                }`}
                style={{ left: x, top: y, pointerEvents: "none" }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-1 px-3 pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-[11px] font-semibold text-[#6c63ff] hover:bg-purple-50 rounded-lg transition-colors"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-3 py-1 text-[11px] font-semibold text-[#6c63ff] hover:bg-purple-50 rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ClockPicker;
