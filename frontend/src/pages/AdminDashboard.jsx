import { useState } from "react";
import {
    BookUp,
    BookX,
    CircleStar,
    KeyRound,
    MessageCircleQuestionMark
} from "lucide-react";

function AdminDashboard() {
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [docsUploaded] = useState(true);

    const adminName = "Admin Name";
    const companyName = "DocMind Innovations";

    return (
        <div className="min-h-screen bg-white text-white">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

                    {/* LEFT MENU */}
                    <aside className="flex h-full flex-col justify-evenly rounded-[32px] bg-[#285A48] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.25)]">
                        <div>
                            <div className="rounded-[28px] border border-[#B0E4CC]/20 bg-[#0F2F26] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#408A71] text-2xl font-bold text-white shadow-inner">
                                        {adminName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.25em] text-[#B0E4CC]/80">Admin</p>
                                        <h2 className="mt-1 text-xl font-semibold text-white">{adminName}</h2>
                                    </div>
                                </div>
                                <p className="text-sm text-[#D9EAD7]">{companyName}</p>
                                <p className="mt-3 text-sm text-[#B0E4CC]">Role: Admin</p>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={() => setActiveMenu("upload")}
                                    className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${activeMenu === "upload" ? "border-[#B0E4CC] bg-[#408A71]/20" : "border-transparent bg-white/5 hover:border-[#B0E4CC]/50 hover:bg-white/10"}`}
                                >
                                    <BookUp className="h-5 w-5 text-[#B0E4CC]" />
                                    <div>
                                        <p className="font-semibold">Upload Documents</p>
                                        <p className="text-xs text-[#D9EAD7]">Add new files to the workspace</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveMenu("remove")}
                                    className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${activeMenu === "remove" ? "border-[#B0E4CC] bg-[#408A71]/20" : "border-transparent bg-white/5 hover:border-[#B0E4CC]/50 hover:bg-white/10"}`}
                                >
                                    <BookX className="h-5 w-5 text-[#B0E4CC]" />
                                    <div>
                                        <p className="font-semibold">Remove Documents</p>
                                        <p className="text-xs text-[#D9EAD7]">Delete outdated files safely</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveMenu("requests")}
                                    className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${activeMenu === "requests" ? "border-[#B0E4CC] bg-[#408A71]/20" : "border-transparent bg-white/5 hover:border-[#B0E4CC]/50 hover:bg-white/10"}`}
                                >
                                    <MessageCircleQuestionMark className="h-5 w-5 text-[#B0E4CC]" />
                                    <div>
                                        <p className="font-semibold">Requests</p>
                                        <p className="text-xs text-[#D9EAD7]">Review document approvals</p>
                                    </div>
                                </button>

                                {docsUploaded && (
                                    <button
                                        onClick={() => setActiveMenu("uploaded")}
                                        className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${activeMenu === "uploaded" ? "border-[#B0E4CC] bg-[#408A71]/20" : "border-transparent bg-white/5 hover:border-[#B0E4CC]/50 hover:bg-white/10"}`}
                                    >
                                        <CircleStar className="h-5 w-5 text-[#B0E4CC]" />
                                        <div>
                                            <p className="font-semibold">Uploaded Docs</p>
                                            <p className="text-xs text-[#D9EAD7]">Active file: token</p>
                                        </div>
                                    </button>
                                )}

                                <button
                                    onClick={() => setActiveMenu("token")}
                                    className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${activeMenu === "token" ? "border-[#B0E4CC] bg-[#408A71]/20" : "border-transparent bg-white/5 hover:border-[#B0E4CC]/50 hover:bg-white/10"}`}
                                >
                                    <KeyRound className="h-5 w-5 text-[#B0E4CC]" />
                                    <div>
                                        <p className="font-semibold">Chat Token</p>
                                        <p className="text-xs text-[#D9EAD7]">docName: token</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                localStorage.removeItem("role");
                                window.location.href = "/";
                            }}
                            className="mt-8 rounded-full bg-[#408A71] px-5 py-3 text-sm font-semibold text-[#091413] transition hover:bg-[#B0E4CC] hover:text-[#091413]"
                        >
                            Logout
                        </button>
                    </aside>

                    {/* RIGHT DASHBOARD */}
                    <main className="rounded-[32px] bg-[#0F2F26] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.25)]">
                        <div className="mb-8 rounded-[28px] border border-[#B0E4CC]/15 bg-[#13372F] p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                            <p className="text-sm uppercase tracking-[0.3em] text-[#B0E4CC]/70">Admin dashboard</p>
                            <h1 className="mt-4 text-4xl font-semibold text-white">Hello, {adminName}.</h1>
                            <p className="mt-4 max-w-3xl text-[#D9EAD7]">
                                Manage company documents, review requests, and keep your knowledge base secure with one clear control center.
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-[28px] border border-[#B0E4CC]/15 bg-[#153B34] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-[#B0E4CC]/70">Upload docs</p>
                                        <h2 className="mt-3 text-2xl font-semibold text-white">Fast file upload</h2>
                                    </div>
                                    <div className="rounded-3xl bg-[#285A48] p-3 text-[#B0E4CC]">
                                        <BookUp className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="mt-4 text-[#D9EAD7]">Drag files here or click to add new documents for your team.</p>
                            </div>

                            <div className="rounded-[28px] border border-[#B0E4CC]/15 bg-[#153B34] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-[#B0E4CC]/70">Current request</p>
                                        <h2 className="mt-3 text-2xl font-semibold text-white">Pending approvals</h2>
                                    </div>
                                    <div className="rounded-3xl bg-[#285A48] p-3 text-[#B0E4CC]">
                                        <MessageCircleQuestionMark className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="mt-4 text-[#D9EAD7]">Review new document requests. Keep collaboration moving without delays.</p>
                            </div>

                            <div className="rounded-[28px] border border-[#B0E4CC]/15 bg-[#153B34] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-[#B0E4CC]/70">Delete docs</p>
                                        <h2 className="mt-3 text-2xl font-semibold text-white">Clean archives</h2>
                                    </div>
                                    <div className="rounded-3xl bg-[#285A48] p-3 text-[#B0E4CC]">
                                        <BookX className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="mt-4 text-[#D9EAD7]">Remove outdated files and keep your workspace streamlined.</p>
                            </div>

                            <div className="rounded-[28px] border border-[#B0E4CC]/15 bg-[#153B34] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-[#B0E4CC]/70">Chat token</p>
                                        <h2 className="mt-3 text-2xl font-semibold text-white">Document token</h2>
                                    </div>
                                    <div className="rounded-3xl bg-[#285A48] p-3 text-[#B0E4CC]">
                                        <KeyRound className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="mt-4 text-[#D9EAD7]">Use the token channel for quick document conversations and knowledge access.</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;