import * as React from "react";

const TimeIcon = ({ width = 24, height = 24 }) =>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="#096"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10"
    />
    <path
      stroke="#096"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 6v6l4 2"
    />
  </svg>;

export default TimeIcon;
