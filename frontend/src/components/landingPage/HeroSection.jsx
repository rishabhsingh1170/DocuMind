import { Link } from "react-router-dom";
import {
  ArrowRight,
  BotMessageSquare,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="section-reveal">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise RAG, Reimagined
          </p>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Give Your Enterprise a Secure AI Brain.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Instantly chat with your company&apos;s private documents, policies,
            and manuals. Built with multi-tenant architecture to guarantee zero
            data leakage.
          </p>

          <div className="mt-8 flex justify-center flex-wrap gap-4">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:bg-indigo-500">
              <Link
                to="/signup"
              >
                Get Start
              </Link>
              <ArrowRight className="h-4 w-4" />
            </button>
            {/* <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
              View Architecture
            </button> */}
          </div>
        </div>

        <div className="section-reveal stagger-1">
          <div className="relative rounded-3xl border border-indigo-200/40 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 p-[1px] shadow-glow">
            <div className="rounded-3xl bg-slate-950/95 p-5 backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-300">
                    <BotMessageSquare className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    DocuMind Enterprise Assistant
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tenant Safe
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-slate-800 p-1.5 text-slate-300">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-slate-900 px-4 py-3 text-sm text-slate-100">
                    What is our leave policy for full-time employees?
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-indigo-500/20 p-1.5 text-indigo-300">
                    <BotMessageSquare className="h-4 w-4" />
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
                    Full-time employees are eligible for 24 annual leave days
                    and 10 sick leave days. Carry-over is capped at 8 days.
                    {/* <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-xs text-slate-300">
                      Sources: HR_Handbook_v5.pdf (0.93),
                      LeavePolicy_Updated.docx (0.89)
                    </div> */}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="Ask another question..."
                      className="w-full bg-transparent text-sm text-slate-400 outline-none"
                    />
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
