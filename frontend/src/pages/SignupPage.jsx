import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";

const initialForm = {
  fullName: "",
  workEmail: "",
  organization: "",
  password: "",
};

export default function SignupPage() {
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsSuccess(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    // TODO: Connect to FastAPI /auth/register endpoint here.
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
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
          value={formData.organization}
          onChange={handleChange}
          placeholder="Acme Corporation"
          autoComplete="organization"
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
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
          {isLoading ? "Creating Workspace..." : "Create Workspace"}
        </button>

        {isSuccess && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            Workspace created successfully. Your tenant setup is ready for
            onboarding.
          </p>
        )}
      </form>

      {/* Toggle */}
      <p className="text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 transition hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
