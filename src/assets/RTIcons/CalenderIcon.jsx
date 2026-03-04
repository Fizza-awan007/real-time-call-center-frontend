import * as React from "react";

const CalenderIcon = ({ width = 16, height = 16 }) =>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 16 16"
  >
    <path
      stroke="#45556C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.333"
      d="M5.333 1.333V4M10.667 1.333V4M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333M2 6.667h12"
    />
  </svg>;

export default CalenderIcon;
