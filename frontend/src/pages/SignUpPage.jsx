import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");

  // Common fields
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Admin fields
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Employee fields
  const [employeeId, setEmployeeId] = useState("");
  const [companyId, setCompanyId] = useState("");

  // 🔴 OTP STATES
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300); // 5 min expiry

  // ⏳ TIMER
  useEffect(() => {
    if (isOtpStep && otpTimer > 0) {
      const timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOtpStep, otpTimer]);

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // 🔹 STEP 1: SEND OTP
    if (!isOtpStep) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      setGeneratedOtp(otp);
      setIsOtpStep(true);
      setOtpTimer(300);

      // 👉 Simulate email (replace with backend API)
      alert(`OTP sent to email: ${otp}`);

      return;
    }

    // 🔹 STEP 2: VERIFY OTP
    if (enteredOtp !== generatedOtp) {
      alert("Invalid OTP");
      return;
    }

    if (otpTimer <= 0) {
      alert("OTP expired");
      return;
    }

    // 🔹 SAVE USER AFTER OTP SUCCESS
    const users = JSON.parse(localStorage.getItem("users")) || [];

    let newUser = {};

    if (role === "admin") {
      newUser = {
        role,
        name,
        email,
        companyName,
        password,
      };

      const exists = users.find((u) => u.email === email);
      if (exists) {
        alert("Admin already exists!");
        return;
      }
    } else {
      newUser = {
        role,
        name,
        employeeId,
        companyName,
        companyId,
        password,
      };

      const exists = users.find((u) => u.employeeId === employeeId);
      if (exists) {
        alert("Employee already exists!");
        return;
      }
    }

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    navigate("/login");
  };

  // 🔁 RESEND OTP
  const resendOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpTimer(300);

    alert(`New OTP sent: ${otp}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#091413] px-4 py-6">
      <div className="w-full max-w-[1000px] overflow-hidden rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative bg-[#285A48] p-10 text-white flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(176,228,204,0.45),_transparent_35%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-full bg-[#408A71] bg-opacity-20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#B0E4CC] shadow-sm shadow-black/10">
                Welcome to DocMind
              </div>

              <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">
                Build secure teams,
                <span className="text-[#B0E4CC]"> streamline workflows</span>, and
                own your company data.
              </h1>

              <div className="mt-10 grid gap-2">
                {/* <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#B0E4CC]">Company details</p>
                  <div className="mt-4 text-sm leading-6 text-[#E7F4E8]">
                    <p className="font-semibold">Company name</p>
                    <p className="text-[#D6E7D4]">DocMind Innovations</p>
                  </div>
                </div> */}

                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#B0E4CC]">Trusted by teams</p>
                  <div className="mt-4 text-sm leading-6 text-[#E7F4E8]">
                    <p className="font-semibold">Secure onboarding</p>
                    <p className="text-[#D6E7D4]">Easy admin controls for employees and roles.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 rounded-[28px] border border-white/10 bg-[#092218] bg-opacity-90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between text-sm text-[#B0E4CC]">
                  <span className="font-semibold">Onboarding facts</span>
                  <span className="text-white/70">Secure • Simple • Fast</span>
                </div>
                <div className="mt-4 space-y-3 text-sm text-[#D6E7D4]">
                  <p>• Support for admin and employee roles.</p>
                  <p>• OTP verification for trusted access.</p>
                  <p>• Smart company detail capture.</p>
                </div>
              </div>
            </div>


          </div>

          <div className="bg-[#F3F9F4] p-10 flex items-center justify-center">
            <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(9,20,19,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[#408A71] font-semibold">Get started</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[#091413]">Create your account</h2>
                </div>
                <span className="rounded-2xl bg-[#B0E4CC] px-4 py-2 text-sm font-semibold text-[#091413]">{role === "admin" ? "Admin" : "Employee"}</span>
              </div>

              {!isOtpStep && (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${role === "admin" ? "bg-[#408A71] text-white shadow-lg shadow-[#408A71]/20" : "bg-[#E7F8E9] text-[#285A48] hover:bg-[#D9F0DF]"}`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("employee")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${role === "employee" ? "bg-[#408A71] text-white shadow-lg shadow-[#408A71]/20" : "bg-[#E7F8E9] text-[#285A48] hover:bg-[#D9F0DF]"}`}
                  >
                    Employee
                  </button>
                </div>
              )}

              <form onSubmit={handleSignup} className="mt-8 space-y-4">
                {!isOtpStep && (
                  <>
                    <label className="block text-sm font-medium text-[#091413]">Full name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    {role === "admin" && (
                      <>
                        <label className="block text-sm font-medium text-[#091413]">Email</label>
                        <input
                          type="email"
                          placeholder="admin@docmind.com"
                          className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />

                        <label className="block text-sm font-medium text-[#091413]">Company name</label>
                        <input
                          type="text"
                          placeholder="Your company name"
                          className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </>
                    )}

                    {role === "employee" && (
                      <>
                        <label className="block text-sm font-medium text-[#091413]">Employee ID</label>
                        <input
                          type="text"
                          placeholder="EMP-12345"
                          className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                        />

                        <label className="block text-sm font-medium text-[#091413]">Company name</label>
                        <input
                          type="text"
                          placeholder="Your company name"
                          className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />

                        <label className="block text-sm font-medium text-[#091413]">Company ID</label>
                        <input
                          type="text"
                          placeholder="Provided by admin"
                          className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                          value={companyId}
                          onChange={(e) => setCompanyId(e.target.value)}
                        />
                      </>
                    )}

                    <label className="block text-sm font-medium text-[#091413]">Password</label>
                    <input
                      type="password"
                      placeholder="Enter a secure password"
                      className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </>
                )}

                {isOtpStep && (
                  <>
                    <label className="block text-sm font-medium text-[#091413]">OTP code</label>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="w-full rounded-3xl border border-[#D5E9D9] bg-[#F8FDF7] px-5 py-3 text-center tracking-[0.26em] text-[#091413] outline-none transition focus:border-[#408A71] focus:ring-2 focus:ring-[#B0E4CC]/50"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                    />
                    <div className="flex items-center justify-between text-sm text-[#285A48]">
                      <p>Expires in: {formatTime(otpTimer)}</p>
                      <button
                        type="button"
                        onClick={resendOtp}
                        className="text-[#408A71] font-semibold hover:text-[#285A48]"
                      >
                        Resend
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full rounded-3xl bg-gradient-to-r from-[#285A48] to-[#408A71] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110"
                >
                  {isOtpStep ? "Verify OTP" : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#637B6D]">
                Already have an account?{' '}
                <span
                  className="cursor-pointer font-semibold text-[#285A48] hover:text-[#408A71]"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}