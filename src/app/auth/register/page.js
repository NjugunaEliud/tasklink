"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  User,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "CLIENT";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: defaultRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed.");
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/auth/login");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Worker photos collage */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {[
            { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80", pos: "center" },
            { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", pos: "center 30%" },
            { url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80", pos: "center" },
            { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", pos: "center top" },
          ].map((img, i) => (
            <div key={i} style={{ backgroundImage: `url('${img.url}')`, backgroundSize: "cover", backgroundPosition: img.pos }} />
          ))}
        </div>
        {/* Overlay — matches hero section */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(37, 99, 235, 0.62)" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#2563eb] border-2 border-white/30 flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Task<span className="text-[#eab308]">Bridge</span></span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join thousands of
            <br />
            <span className="text-[#eab308]">Clients &amp; Taskers</span>
          </h2>
          <p className="text-white/80 text-lg max-w-sm mx-auto">
            Post tasks, bid on work, and transact securely with M-Pesa escrow protection.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Plumber", "Carpenter", "Driver", "Welder", "Cleaner", "Electrician"].map((s) => (
              <span key={s} className="bg-white/15 border border-white/25 text-white/90 text-xs px-3 py-1.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a]">Task<span className="text-[#2563eb]">Bridge</span></span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-500 mb-6">
            Already registered?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "CLIENT" })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.role === "CLIENT"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              <User className="w-6 h-6" />
              <div>
                <div className="font-semibold text-sm">Client</div>
                <div className="text-xs opacity-70">Post tasks</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "TASKER" })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.role === "TASKER"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              <Wrench className="w-6 h-6" />
              <div>
                <div className="font-semibold text-sm">Tasker</div>
                <div className="text-xs opacity-70">Do the work</div>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                M-Pesa phone number
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="0712345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 pr-12"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-6">
            By registering you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
