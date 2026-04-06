import { Building2, Sparkles } from "lucide-react";

export default function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-slate-950 md:flex md:w-[46%] lg:w-1/2">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(99,102,241,0.45),transparent_40%),radial-gradient(circle_at_80%_75%,rgba(14,165,233,0.3),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 lg:p-14">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Trusted By Enterprises
        </div>

        <div className="space-y-6">
          <h2 className="max-w-xl text-3xl font-semibold leading-tight text-white lg:text-4xl">
            Join  with
            DocuMind AI.
          </h2>
          <p className="max-w-lg text-sm text-slate-300 lg:text-base">
            "DocuMind AI helped us launch isolated knowledge workspaces per
            business unit in under two weeks while improving access governance
            and traceability."
          </p>
          <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-100">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              {/* <p className="text-sm font-semibold text-white">Priya Nair</p>
              <p className="text-xs text-slate-300">
                 Knowledge Systems · Fintech Enterprise
              </p> */}
            </div>
          </div>
        </div>

        {/* <p className="text-xs tracking-wide text-slate-400">
          SOC 2 aligned workflows · Tenant isolation ready · Audit-friendly
          automations
        </p> */}
      </div>
    </aside>
  );
}
