"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Eye, EyeOff, Loader2, Wrench } from "lucide-react";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password.");
      } else {
        toast.success("Welcome back!");
        // Fetch session to redirect by role
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role;

        if (callbackUrl) return router.push(callbackUrl);
        if (role === "CLIENT") router.push("/client/dashboard");
        else if (role === "TASKER") router.push("/tasker/dashboard");
        else if (role === "ADMIN") router.push("/admin/dashboard");
        else router.push("/");
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
            Welcome back to
            <br />
            <span className="text-[#eab308]">your workspace</span>
          </h2>
          <p className="text-white/80 text-lg max-w-sm mx-auto">
            Manage tasks, proposals, and payments — all from one secure dashboard.
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
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a]">Task<span className="text-[#2563eb]">Bridge</span></span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 mb-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register here
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
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
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 pr-12"
                  placeholder="Your password"
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
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <Link
              href="/auth/register?role=TASKER"
              className="w-full border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-3"
            >
              <Wrench className="w-4 h-4" />
              Become a Tasker
            </Link>
          </form>

          <p className="text-center text-gray-400 text-xs mt-8">
            TaskBridge © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
