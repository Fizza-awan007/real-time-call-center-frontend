import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RTInput from "../../common-components/RTInput";
import RTButton from "../../common-components/RTButton";

const RTLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    localStorage.setItem("access_token", "mock_token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] p-6">
      <div className="w-full max-w-[420px] rounded-2xl bg-white px-7 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:px-10 sm:py-12">
        <div className="mb-9 flex items-center justify-center gap-3">
          <div className="flex shrink-0 items-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#F5A623" />
              <path
                d="M15 33 L24 15 L33 33"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="36" r="3" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col leading-[1.1]">
            <span className="text-lg font-bold tracking-[2px] text-[#1a1d23]">WESTLAKE</span>
            <span className="text-[10px] font-normal uppercase tracking-[1.2px] text-gray-500">FULFILLMENT CENTER</span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-1.5 text-[22px] font-bold text-[#1a1d23]">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <RTInput
            id="email"
            label="Email address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <RTInput
            id="password"
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <RTButton type="submit" fullWidth>
            Sign in
          </RTButton>
        </form>
      </div>
    </div>
  );
};

export default RTLogin;
