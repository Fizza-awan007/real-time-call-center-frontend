const RTButton = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const variantClass =
    variant === "secondary"
      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
      : "bg-indigo-500 text-white hover:bg-indigo-600";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${fullWidth ? "w-full" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default RTButton;
