import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import { API_BASE_URL, APIS } from "../utils/apis";

const initialForm = {
  fullName: "",
  workEmail: "",
  organization: "",
  password: "",
  role: "admin", // default role
};

export default function SignupPage() {
  const [formData, setFormData] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(30);

  const navigate = useNavigate();

  // ⏱️ Timer for resend OTP
  useEffect(() => {
    let interval;
    if (showOtpInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsSuccess(false);
    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 SEND OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}${APIS.AUTH.SEND_OTP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.workEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setIsSuccess(true);
      setShowOtpInput(true);
      setTimer(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 VERIFY OTP + SIGNUP
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}${APIS.AUTH.VERIFY_OTP_AND_SIGNUP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.workEmail,
          password: formData.password,
          otp: otp,
          role: formData.role,
          company_id: null, //formData.organization
          profile_url: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 RESEND OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}${APIS.AUTH.SEND_OTP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.workEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to resend OTP");

      setTimer(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Enterprise Secure Access
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Create your DocuMind AI workspace
        </h1>
        <p className="max-w-lg text-sm text-slate-500 sm:text-base">
          Provision your tenant, centralize private knowledge, and automate
          retrieval across teams.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="fullName"
          label="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Alex Morgan"
          autoComplete="name"
        />

        <AuthInput
          id="workEmail"
          label="Work Email"
          type="email"
          value={formData.workEmail}
          onChange={handleChange}
          placeholder="you@company.com"
          autoComplete="email"
        />

        <AuthInput
          id="organization"
          label="Company / Organization Name"
          value={null}//{formData.organization}
          onChange={handleChange}
          placeholder="Company/Corporation Name"
          autoComplete="organization"
        />

        {/* Role */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Role
          </label>
          <div className="flex items-center gap-6 text-sm text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === "admin"}
                onChange={handleChange}
                className="h-4 w-4 accent-indigo-600"
              />
              Admin
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="employee"
                checked={formData.role === "employee"}
                onChange={handleChange}
                className="h-4 w-4 accent-indigo-600"
              />
              Employee
            </label>
          </div>
        </div>

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || showOtpInput}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isLoading ? "Processing..." : "Create Workspace"}
        </button>

        {/* Success */}
        {isSuccess && !showOtpInput && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            OTP sent to your email.
          </p>
        )}

        {/* ERROR */}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {/* OTP Section */}
        {showOtpInput && (
          <div className="space-y-3">
            <AuthInput
              id="otp"
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
            />

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Verify OTP
            </button>

            {/* Resend OTP */}
            <p className="text-center text-xs text-slate-500">
              {timer > 0 ? (
                `Resend OTP in ${timer}s`
              ) : (
                <span
                  onClick={handleResendOtp}
                  className="cursor-pointer font-semibold text-indigo-600"
                >
                  Resend OTP
                </span>
              )}
            </p>
          </div>
        )}
      </form>

      {/* Toggle */}
      <p className="text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          login
        </Link>
      </p>
    </AuthLayout>
  );
}
