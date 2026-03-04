import * as React from "react";

const HiddenIcon = ({ width = 25, height = 24, fill = "#979797" }) =>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 25 24"
  >
    <path
      fill={fill}
      fillRule="evenodd"
      d="M11.366 17.96q.45.04.927.04c5.033 0 9.228-6 9.228-6s-.687-.982-1.838-2.152zM14.862 6.495C14.044 6.187 13.182 6 12.293 6c-6.71 0-9.227 6-9.227 6s.77 1.834 2.59 3.473L9.219 12c0-1.657 1.377-3 3.075-3z"
      clipRule="evenodd"
    />
    <path
      fill={fill}
      d="M5.22 18.435 18.992 5l1.45 1.414L6.669 19.85z"
      opacity="0.3"
    />
  </svg>;

export default HiddenIcon;
