import Link from "next/link";
import {
  CheckCircle,
  Shield,
  Zap,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Phone,
  Clock,
  Award,
  Plus,
} from "lucide-react";

export default function HomePage() {
  const stats = [
    { label: "Active Taskers", value: "240+", icon: Users },
    { label: "Tasks Completed", value: "130+", icon: CheckCircle },
    { label: "Revenue Processed", value: "KES 20,000+", icon: TrendingUp },
    { label: "Avg. Rating", value: "4.8 / 5", icon: Star },
  ];

  const features = [
    { icon: Shield, title: "M-Pesa Escrow Protection", description: "Funds are held securely until task completion. Clients pay confidently, Taskers get paid reliably." },
    { icon: Zap, title: "Instant STK Push Payments", description: "No manual transfers. M-Pesa STK Push delivers seamless, real-time payment confirmation." },
    { icon: Users, title: "Verified Taskers", description: "Every Tasker is reviewed and verified by our admin team before appearing on the platform." },
    { icon: Phone, title: "Real-Time Chat", description: "Communicate directly with your Client or Tasker through our built-in messaging system." },
    { icon: Clock, title: "Transparent Bidding", description: "Clients set fixed budgets. Taskers submit proposals with timelines — no hidden negotiations." },
    { icon: Award, title: "Ratings & Reviews", description: "Build trust through honest feedback. Ratings are only unlocked after task completion." },
  ];

  const categories = [
    { name: "Mama Fua", icon: "👗", sub: "Laundry & Ironing", from: "KES 300" },
    { name: "Shamba Boy", icon: "🌱", sub: "Gardening", from: "KES 500" },
    { name: "Plumber", icon: "🔧", sub: "Plumbing & Pipework", from: "KES 800" },
    { name: "Welder", icon: "🔥", sub: "Welding & Fabrication", from: "KES 1,200" },
    { name: "Carpenter", icon: "🪵", sub: "Furniture & Woodwork", from: "KES 1,000" },
    { name: "Home Repairs", icon: "🏠", sub: "Fundi & General Repairs", from: "KES 600" },
    { name: "Movers", icon: "🚛", sub: "Moving & Relocation", from: "KES 2,000" },
    { name: "Cleaning", icon: "🧹", sub: "Deep Cleaning", from: "KES 700" },
    { name: "Electrician", icon: "⚡", sub: "Wiring & Installations", from: "KES 900" },
    { name: "Painter", icon: "🖌️", sub: "Interior & Exterior", from: "KES 1,500" },
    { name: "Driver", icon: "🚗", sub: "Errands & Transport", from: "KES 500" },
    { name: "Security", icon: "🛡️", sub: "Guards & Watchmen", from: "KES 1,800" },
  ];

  const heroPills = [
    { label: "Mama Fua", from: "KES 300" },
    { label: "Plumber", from: "KES 800" },
    { label: "Carpenter", from: "KES 1,200" },
    { label: "Electrician", from: "KES 900" },
  ];

  const howItWorks = [
    { step: "01", role: "Client", title: "Post Your Task", desc: "Describe what you need, set a budget and deadline. Our platform matches you with qualified Taskers." },
    { step: "02", role: "Client", title: "Review Proposals", desc: "Taskers submit proposals with their approach and estimated duration. Choose the best fit." },
    { step: "03", role: "Client", title: "Pay via M-Pesa", desc: "Accept a proposal and receive an STK Push. Funds go into secure escrow — not to the Tasker yet." },
    { step: "04", role: "Tasker", title: "Complete & Get Paid", desc: "Tasker delivers work, Client confirms completion. 95% is released instantly to Tasker via M-Pesa." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-extrabold text-[#0f172a] tracking-tight">Task<span className="text-[#2563eb]">Bridge</span></div>
                <div className="text-[10px] text-[#64748b] font-medium -mt-0.5">Find trusted local help</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#374151]">
              <a href="#how-it-works" className="hover:text-[#2563eb] transition-colors">How It Works</a>
              <a href="#categories" className="hover:text-[#2563eb] transition-colors">Browse Tasks</a>
              <a href="#features" className="hover:text-[#2563eb] transition-colors">Features</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-[#374151] hover:text-[#2563eb] transition-colors px-3 py-2">Sign In</Link>
              <Link href="/auth/register" className="flex items-center gap-1.5 text-sm font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                <Plus className="w-4 h-4" />Post a Task
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: "580px" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=85')", backgroundSize: "cover", backgroundPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(37, 99, 235, 0.62)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-sm px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-green-300" />
            Get your home tasks done fast by trusted local Taskers.
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Find trusted local help<br />for your tasks.
          </h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            Post a task and get offers from verified professionals near you — plumbing, cleaning, carpentry, moving, and more.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {heroPills.map((pill) => (
              <Link key={pill.label} href="/tasks" className="bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm transition-colors font-medium">
                {pill.label} <span className="text-white/70 font-normal">from {pill.from}</span>
              </Link>
            ))}
          </div>
          <Link href="/auth/register?role=CLIENT" className="inline-flex items-center gap-2 bg-[#eab308] hover:bg-[#ca8a04] text-[#0f172a] font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg">
            Post a task <ArrowRight className="w-5 h-5" />
          </Link>
           <Link href="/auth/register?role=TASKER" className="inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all">
            Become a Tasker <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/60 text-sm mt-4">Takes less than 2 minutes · Free to post</p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center py-7 gap-1">
                <stat.icon className="w-5 h-5 text-[#2563eb] mb-1" />
                <span className="text-2xl font-extrabold text-[#0f172a]">{stat.value}</span>
                <span className="text-xs text-[#64748b]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3 block">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-4">How TaskBridge Works</h2>
            <p className="text-[#64748b] text-lg max-w-xl mx-auto">From task posting to payment release — transparent, secure, and fast.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                <div className="w-12 h-12 bg-[#2563eb] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-sm">{item.step}</span>
                </div>
                <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">{item.role}</span>
                <h3 className="text-base font-bold text-[#0f172a] mt-1 mb-2">{item.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#60a5fa] mb-3 block">Browse Categories</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Whatever you need done</h2>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">There&apos;s a skilled Tasker ready for it.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href="/tasks" className="group bg-white/5 hover:bg-[#2563eb]/20 border border-white/10 hover:border-[#2563eb]/40 rounded-2xl p-5 text-center transition-all card-hover">
                <div className="text-3xl mb-2">{cat.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-0.5">{cat.name}</h3>
                <p className="text-[#94a3b8] text-xs">{cat.sub}</p>
                <p className="text-[#60a5fa] text-xs font-semibold mt-1">from {cat.from}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/tasks" className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Browse All Tasks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3 block">Why TaskBridge</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-4">Built for trust. Designed for results.</h2>
            <p className="text-[#64748b] text-lg max-w-xl mx-auto">Every feature is crafted to make the Client-Tasker relationship smooth, transparent, and secure.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div key={feat.title} className="group p-7 rounded-2xl border border-gray-100 hover:border-[#2563eb]/30 bg-[#f8fafc] hover:bg-blue-50 transition-all card-hover">
                <div className="w-11 h-11 bg-[#2563eb] rounded-xl flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#0f172a] mb-2">{feat.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section className="py-20 bg-[#1e3a8a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-10 h-10 text-[#93c5fd] mx-auto mb-5" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Your money is always safe</h2>
          <p className="text-[#bfdbfe] text-lg mb-8 max-w-2xl mx-auto">
            Payments are held in escrow until the task is confirmed complete. Only 95% reaches the Tasker — after your approval.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["STK Push Verified", "Escrow Protected", "B2C Instant Payout", "Admin Dispute Resolution"].map((label) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm px-5 py-2.5 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#86efac]" />{label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-4">Ready to get started?</h2>
          <p className="text-[#64748b] text-lg mb-10">Join thousands of Clients and Taskers already using TaskBridge.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register?role=CLIENT" className="w-full sm:w-auto bg-[#eab308] hover:bg-[#ca8a04] text-[#0f172a] font-bold px-9 py-4 rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2">
              I need a Tasker <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/register?role=TASKER" className="w-full sm:w-auto border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white font-bold px-9 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2">
              I want to work
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-[#94a3b8] py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-extrabold">Task<span className="text-[#60a5fa]">Bridge</span></span>
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed">Connecting talent with opportunity, secured by M-Pesa escrow.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tasks" className="hover:text-white transition-colors">Browse Tasks</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Post a Task</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-[#475569]">
            {`© ${new Date().getFullYear()} TaskBridge. All rights reserved. · Platform fee: 5% deducted from Tasker payout only.`}
          </div>
        </div>
      </footer>
    </div>
  );
}
