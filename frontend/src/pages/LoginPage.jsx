import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Lock } from "lucide-react";


function LoginPage() {
    const [role, setRole] = useState("employee");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // For now just log (later connect backend)
        console.log({
            email,
            password,
            role,
        });

        // TEMP auth (replace with backend later)
        localStorage.setItem("role", role);

        if (role === "admin") {
            navigate("/admin-dashboard");
        } else {
            navigate("/employee-dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#091413] px-4 py-6">



            <div className="w-full max-w-[1000px] overflow-hidden rounded-[32px] bg-[#091413] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="bg-[#F3F9F4] p-5 flex items-center justify-center">
                        <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(9,20,19,0.12)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.25em] text-[#408A71] font-semibold">Welcome back</p>
                                    <h2 className="mt-3 text-3xl font-semibold text-[#091413]">Login to your account</h2>
                                </div>
                                <span className="rounded-2xl bg-[#B0E4CC] px-4 py-2 text-sm font-semibold text-[#091413]">{role === "admin" ? "Admin" : "Employee"}</span>
                            </div>

                            <form onSubmit={handleLogin} className="mt-8 space-y-5">

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-[#091413]">Role</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="admin"
                                    checked={role === "admin"}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                Admin
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="employee"
                                    checked={role === "employee"}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                Employee
                            </label>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[#091413]">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-[#091413]">Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full rounded-3xl bg-gradient-to-r from-[#285A48] to-[#408A71] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110"
                    >
                        Login
                    </button>
                </form>

                            <p className="mt-6 text-center text-sm text-[#637B6D]">
                                New here?{' '}
                                <span
                                    className="cursor-pointer font-semibold text-[#285A48] hover:text-[#408A71]"
                                    onClick={() => navigate('/signup')}
                                >
                                    Sign Up
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="relative bg-[#285A48] p-5 text-white flex flex-col justify-between overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(176,228,204,0.35),_transparent_35%)] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-3 rounded-full bg-[#408A71] bg-opacity-20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#B0E4CC] shadow-sm shadow-black/10">
                                Seamless access
                            </div>

                            <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">
                                Fast login for every team member
                            </h1>

                            <p className="mt-6 max-w-xl text-[#DCEFD9] text-sm leading-7">
                                Jump back into your workspace with a calm and confident experience.
                                This login panel keeps your access simple while staying aligned with the DocMind brand.
                            </p>

                            <div className="mt-10 grid gap-4">
                                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[#B0E4CC]">Security first</p>
                                    <div className="mt-4 text-sm leading-6 text-[#E7F4E8]">
                                        <p className="font-semibold">Protected access</p>
                                        <p className="text-[#D6E7D4]">Login flow designed around trust and speed.</p>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[#B0E4CC]">Role aware</p>
                                    <div className="mt-4 text-sm leading-6 text-[#E7F4E8]">
                                        <p className="font-semibold">Admin + Employee</p>
                                        <p className="text-[#D6E7D4]">Choose your workspace instantly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;