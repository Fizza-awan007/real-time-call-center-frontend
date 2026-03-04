import { useState } from "react";
import PasswordIcon from "../../RTIcons/PasswordIcon";
import HiddenIcon from "../../RTIcons/HiddenIcon";

const RTInput = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  id,
  error,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label &&
        <label htmlFor={id} className="text-[13px] font-medium text-gray-700">
          {label}
        </label>}
      <div className="relative w-full">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-[#1a1d23] outline-none transition-shadow placeholder:text-gray-400 ${isPassword
            ? "pr-10"
            : ""} ${error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"}`}
          {...props}
        />
        {isPassword &&
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword
              ? <PasswordIcon width={20} height={20} />
              : <HiddenIcon width={20} height={16} />}
          </button>}
      </div>
      {error &&
        <span className="text-xs text-red-500">
          {error}
        </span>}
    </div>
  );
};

export default RTInput;
