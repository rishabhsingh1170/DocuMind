import { CheckCircle2, Send, Shield } from "lucide-react";

export default function EmployeeAccessPanel({
  activeEmployeeAction,
  accessCode,
  setAccessCode,
  isVerifyingCode,
  onVerifyAccessCode,
  employeeError,
  employeeMessage,
  isRequestingAccess,
  onRequestAccess,
  verificationToken,
}) {
  return (
    <div className="mt-8 space-y-6">
      {activeEmployeeAction === "verify" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 ">
          
          <h3 className="mb-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Shield className="h-5 w-5 text-indigo-600" />
            Verify Access Code
          </h3>
          <p className="mb-4 text-sm text-slate-600">
            Enter the code shared by your admin.
          </p>

          <form onSubmit={onVerifyAccessCode} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Access Code
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="AB12CD"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingCode}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isVerifyingCode ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          {employeeError && (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {employeeError}
            </p>
          )}
          {employeeMessage && (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {employeeMessage}
            </p>
          )}
        </div>
      )}

      {activeEmployeeAction === "request" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Send className="h-5 w-5 text-indigo-600" />
            Request Access
          </h3>
          <p className="mb-4 text-sm text-slate-600">
            Request access after verifying the code.
          </p>

          <button
            type="button"
            onClick={onRequestAccess}
            disabled={!verificationToken || isRequestingAccess}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isRequestingAccess ? "Requesting..." : "Request Access"}
          </button>

          {!verificationToken && (
            <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Verify the code first to enable this action.
            </p>
          )}

          {employeeError && (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {employeeError}
            </p>
          )}
          {employeeMessage && (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {employeeMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
