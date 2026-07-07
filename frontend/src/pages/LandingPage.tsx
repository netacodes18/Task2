import { Link } from 'react-router-dom';
import { BarChart2, MessageSquare, Upload, Zap, ArrowRight, Database, TrendingUp, PieChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f2eb] font-sans overflow-x-hidden">

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981] p-2 rounded-lg">
              <BarChart2 size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">DataChat</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition">How It Works</a>
          </div>
          <Link
            to="/app"
            className="bg-[#2a5c48] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1e4535] transition-all shadow-lg shadow-emerald-900/10"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-6 relative">
        {/* Background decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-emerald-200">
            <Zap size={14} /> AI-Powered Data Analytics
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Talk to Your Data.
            <br />
            <span className="bg-gradient-to-r from-[#10b981] to-[#0d9488] bg-clip-text text-transparent">
              Get Instant Insights.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any CSV or Excel file, and let our AI automatically generate beautiful dashboards, answer your questions in plain English, and uncover hidden patterns in your data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 bg-[#10b981] text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl text-base font-bold border border-gray-200 hover:border-gray-300 transition-all hover:-translate-y-0.5"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-16 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 border border-gray-200/80 p-2">
            <div className="bg-[#f9fafb] rounded-2xl p-6 md:p-8">
              {/* Fake top bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 bg-gray-200 h-5 w-48 rounded-full" />
              </div>
              {/* Fake KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {['Total Records', 'Avg Revenue', 'Top Category', 'Growth Rate'].map((label, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1">{label}</div>
                    <div className="text-xl font-bold text-gray-800">{['12,847', '$4,320', 'Tech', '+23.5%'][i]}</div>
                  </div>
                ))}
              </div>
              {/* Fake chart placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-5 border border-gray-100 h-40 flex items-end justify-between px-6">
                  {[60, 45, 80, 55, 90, 70, 95, 65, 85, 75].map((h, i) => (
                    <div key={i} className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-sm" style={{ width: '8%', height: `${h}%` }} />
                  ))}
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 h-40 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-[12px] border-emerald-400 border-t-violet-400 border-r-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Everything You Need to Understand Your Data</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">No SQL knowledge required. No complex BI tools. Just upload, ask, and get answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-[#f4f2eb] rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl inline-block mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Generated Dashboards</h3>
              <p className="text-gray-500 leading-relaxed">
                Our AI automatically analyzes your data schema and generates beautiful KPI cards, bar charts, pie charts, and line charts — no configuration needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-[#f4f2eb] rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl inline-block mb-5 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chat with Your Data</h3>
              <p className="text-gray-500 leading-relaxed">
                Ask questions in plain English like "What are the top 5 products by revenue?" and get instant answers powered by advanced AI models.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-[#f4f2eb] rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-violet-100 text-violet-600 p-3 rounded-2xl inline-block mb-5 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Data Import</h3>
              <p className="text-gray-500 leading-relaxed">
                Drag and drop any CSV or Excel file. We automatically detect column types, parse your data, and store it securely — ready for analysis in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 bg-[#f4f2eb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Three Steps to Data Clarity</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">From raw spreadsheet to actionable insights in under a minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', icon: <Database size={24} />, title: 'Upload Your Data', desc: 'Drop in any CSV or Excel file. We handle the rest — schema detection, data cleaning, and secure storage.' },
              { step: '02', icon: <PieChart size={24} />, title: 'AI Analyzes Everything', desc: 'Our AI examines your dataset and automatically generates optimized queries for KPIs, charts, and trend analysis.' },
              { step: '03', icon: <MessageSquare size={24} />, title: 'Ask & Explore', desc: 'Chat with your data in plain English or browse the auto-generated dashboard. Dive deeper into any metric instantly.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-6xl font-black text-emerald-100 mb-4 select-none">{item.step}</div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 -mt-8 relative z-10">
                  <div className="bg-[#2a5c48] text-white p-3 rounded-xl inline-block mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 md:py-28 px-6 bg-[#2a5c48] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border border-white/20 rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to Unlock Your Data?</h2>
          <p className="text-emerald-200 text-lg mb-10 max-w-xl mx-auto">
            Stop struggling with pivot tables and complex formulas. Let AI do the heavy lifting so you can focus on decisions.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 bg-white text-[#2a5c48] px-10 py-4 rounded-2xl text-lg font-bold hover:bg-emerald-50 transition-all shadow-2xl hover:-translate-y-0.5"
          >
            Start Analyzing Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#10b981] p-1.5 rounded-lg">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="text-white font-bold">DataChat</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} DataChat.</p>
        </div>
      </footer>
    </div>
  );
}
