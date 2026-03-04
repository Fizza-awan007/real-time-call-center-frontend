import * as React from "react";

const GraphIcon = ({ width = 24, height = 24 }) =>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="#9810FA"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m22 7-8.5 8.5-5-5L2 17"
    />
    <path
      stroke="#9810FA"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 7h6v6"
    />
  </svg>;

export default GraphIcon;
