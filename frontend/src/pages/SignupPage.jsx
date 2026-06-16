import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import { authAPI, setAuthData } from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  workEmail: "",
  password: "",
  role: "employee",
  otp: "",
};

function validatePasswordStrength(password) {
  const value = String(password || "");

  if (value.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (/\s/.test(value)) {
    return "Password must not contain spaces.";
  }

  if (!/[a-z]/.test(value)) {
    return "Password must include at least one lowercase letter.";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/[0-9]/.test(value)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Password must include at least one special character.";
  }

  return "";
}

export default function SignupPage() {
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("initial"); // "initial" -> "otp" -> "success"
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((value) => !value);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const passwordError = validatePasswordStrength(formData.password);
    if (passwordError) {
      setIsLoading(false);
      setError(passwordError);
      return;
    }

    try {
      // Send OTP to email
      await authAPI.sendOTP(formData.workEmail);
      setOtpSent(true);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
      console.error("Send OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTPAndSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const passwordError = validatePasswordStrength(formData.password);
    if (passwordError) {
      setIsLoading(false);
      setError(passwordError);
      return;
    }

    if (formData.otp.trim().length === 0) {
      setIsLoading(false);
      setError("Verification code is required.");
      return;
    }

    try {
      // Verify OTP and complete signup
      const response = await authAPI.verifyOTPAndSignup(
        formData.workEmail.trim(),
        formData.otp.trim(),
        formData.fullName.trim(),
        formData.password,
        formData.role,
      );

      // Store auth data in localStorage
      setAuthData(response);

      // Update AuthContext state
      login(response);

      setStep("success");
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
      console.error("Signup error:", err);
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
          {step === "initial" && "Create your DocuMind AI workspace"}
          {step === "otp" && "Verify your email"}
          {step === "success" && "Welcome to DocuMind AI"}
        </h1>
        <p className="max-w-lg text-sm text-slate-500 sm:text-base">
          {step === "initial" &&
            "Provision your tenant, centralize private knowledge, and automate retrieval across teams."}
          {step === "otp" &&
            `We've sent a verification code to ${formData.workEmail}`}
          {step === "success" &&
            "Your account has been created successfully. Redirecting to your workspace..."}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={step === "initial" ? handleSendOTP : handleVerifyOTPAndSignup}
        className="space-y-5"
      >
        {step === "initial" && (
          <>
            <AuthInput
              id="fullName"
              label="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Akshay kumar"
              autoComplete="name"
              required
            />

            <AuthInput
              id="workEmail"
              label="Work Email"
              type="email"
              value={formData.workEmail}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />

            <AuthInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              trailingAction={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="inline-flex items-center justify-center text-slate-500 transition hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <p className="-mt-2 text-xs leading-5 text-slate-500">
              Use at least 8 characters with uppercase, lowercase, number, and
              special character. Spaces are not allowed.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium text-slate-500"
              >
                Account Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {isLoading ? "Sending OTP..." : "Continue"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <AuthInput
              id="otp"
              label="Verification Code"
              value={formData.otp}
              onChange={handleChange}
              placeholder="000000"
              maxLength="6"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {isLoading ? "Verifying..." : "Create Workspace"}
            </button>

            <button
              type="button"
              onClick={() => setStep("initial")}
              className="w-full text-center text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Back
            </button>
          </>
        )}

        {error && (
          <p className="inline-flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        {step === "success" && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            Your workspace is ready! Redirecting...
          </p>
        )}
      </form>

      {/* Toggle */}
      {step !== "success" && (
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
