import { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import RTInput from "../../common-components/RTInput";
import RTButton from "../../common-components/RTButton";
import { postAPIWithAuth } from "../../../utils/api";
import { AUTH_REGISTER } from "../../../utils/apiUrls";

const RegisterUser = ({ onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await postAPIWithAuth(AUTH_REGISTER, {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });

      if (!res.success) {
        toast.error(
          res.data?.error || res.data?.message || "Registration failed. Please try again."
        );
        return;
      }

      toast.success(`User "${form.name.trim()}" registered successfully.`);
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Register User</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">Create a new user account</p>
          </div>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors outline-none"
            onClick={onClose}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form className="px-6 py-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <RTInput
            id="reg-name"
            label="Full Name"
            type="text"
            name="name"
            placeholder="Stephanie"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <RTInput
            id="reg-email"
            label="Email Address"
            type="email"
            name="email"
            placeholder="stephanie@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <RTInput
            id="reg-password"
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-all outline-none"
            >
              Cancel
            </button>
            <div className="flex-1">
              <RTButton type="submit" fullWidth disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </RTButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default RegisterUser;
