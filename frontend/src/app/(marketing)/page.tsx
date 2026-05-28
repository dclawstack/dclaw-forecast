import Link from "next/link";
import {
  TrendingUp, Bot, GitBranch, Database, BarChart3, Shield,
  ChevronRight, Sparkles, ArrowRight, CheckCircle, Zap,
  LineChart, Activity, Target,
} from "lucide-react";

// ─── Inline decorative grid pattern ──────────────────────────────────────────
function GridPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

// ─── Fake forecast chart (SVG) ────────────────────────────────────────────────
function ForecastChart() {
  const historical = [
    [0, 80], [40, 65], [80, 75], [120, 60], [160, 85], [200, 70],
    [240, 90], [280, 78], [320, 95], [360, 82],
  ];
  const forecast = [
    [360, 82], [400, 95], [440, 105], [480, 98], [520, 115], [560, 122],
  ];
  const lower = [
    [360, 82], [400, 80], [440, 88], [480, 78], [520, 92], [560, 96],
  ];
  const upper = [
    [360, 82], [400, 110], [440, 122], [480, 118], [520, 138], [560, 148],
  ];

  const toPath = (pts: number[][]) =>
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x + 30} ${140 - y}`).join(" ");

  return (
    <svg viewBox="0 0 620 180" className="w-full" xmlns="http://www.w3.org/2000/svg">
      {/* confidence band */}
      <path
        d={`${toPath(upper)} ${[...lower].reverse().map(([x, y], i) => `${i === 0 ? "L" : "L"} ${x + 30} ${140 - y}`).join(" ")} Z`}
        fill="#10B981" fillOpacity="0.12"
      />
      {/* historical line */}
      <path d={toPath(historical)} fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      {/* forecast line */}
      <path d={toPath(forecast)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" />
      {/* forecast upper bound */}
      <path d={toPath(upper)} fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.4" />
      {/* forecast lower bound */}
      <path d={toPath(lower)} fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.4" />
      {/* data points */}
      {historical.map(([x, y], i) => (
        <circle key={i} cx={x + 30} cy={140 - y} r="3" fill="#94A3B8" />
      ))}
      {forecast.slice(1).map(([x, y], i) => (
        <circle key={i} cx={x + 30} cy={140 - y} r="3.5" fill="#10B981" />
      ))}
      {/* vertical divider at forecast start */}
      <line x1="390" y1="10" x2="390" y2="150" stroke="#10B981" strokeWidth="1" strokeDasharray="4 2" strokeOpacity="0.5" />
      {/* labels */}
      <text x="300" y="170" fill="#94A3B8" fontSize="10" textAnchor="middle">Historical</text>
      <text x="490" y="170" fill="#10B981" fontSize="10" textAnchor="middle">AI Forecast</text>
    </svg>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon, title, description, accent = false,
}: {
  icon: React.ReactNode; title: string; description: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
      accent
        ? "bg-gradient-to-br from-teal-600 to-emerald-700 border-teal-500 text-white"
        : "bg-white border-slate-200 text-slate-800"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
        accent ? "bg-white/20" : "bg-teal-50"
      }`}>
        <span className={accent ? "text-white" : "text-teal-600"}>{icon}</span>
      </div>
      <h3 className={`font-semibold mb-2 ${accent ? "text-white" : "text-slate-900"}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${accent ? "text-teal-100" : "text-slate-500"}`}>{description}</p>
    </div>
  );
}

// ─── Step card ───────────────────────────────────────────────────────────────
function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-teal-200 mt-1">{label}</div>
    </div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-teal-700">
            <TrendingUp className="w-5 h-5" />
            <span>DClaw Forecast</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#ai" className="hover:text-slate-900 transition-colors">AI Copilot</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 pt-20">
        <GridPattern />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered · Multi-Model · Scenario Planning
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Forecast the Future{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                with AI Precision
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
              DClaw Forecast uses ensemble AI models to turn your historical time-series data
              into 12-month predictions with confidence intervals, scenario planning, and an
              intelligent copilot that answers your planning questions in plain English.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-teal-500/25"
              >
                Start forecasting free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-xl border border-white/20 transition-colors"
              >
                See how it works <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            {/* Mini trust badges */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              {["MAPE < 15%", "4 AI Models", "Real-time scenarios", "No credit card"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: chart card */}
          <div className="relative">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-2xl">
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Electronics Demand</p>
                  <p className="text-2xl font-bold text-white">122K <span className="text-teal-400 text-sm font-normal">+18%</span></p>
                </div>
                <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs px-2.5 py-1 rounded-full">
                  <Activity className="w-3 h-3" /> Ensemble · 12m
                </div>
              </div>
              <ForecastChart />
              {/* Bottom metrics */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-0.5">MAPE</p>
                  <p className="text-sm font-semibold text-teal-400">9.7%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-0.5">Confidence</p>
                  <p className="text-sm font-semibold text-white">95%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-0.5">Horizon</p>
                  <p className="text-sm font-semibold text-white">12 months</p>
                </div>
              </div>
            </div>
            {/* Floating chat bubble */}
            <div className="absolute -bottom-4 -left-4 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 shadow-lg text-xs text-slate-300 max-w-[200px]">
              <span className="text-teal-400 font-medium">AI Copilot:</span> Demand peaks in Q4 — consider a +15% safety stock buffer.
            </div>
            {/* Floating scenario badge */}
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              Optimistic +10%
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 inset-x-0 bg-teal-900/60 backdrop-blur border-t border-teal-800/50">
          <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value="<15%" label="Average MAPE" />
            <Stat value="4" label="AI Models" />
            <Stat value="12mo" label="Max Horizon" />
            <Stat value="∞" label="Scenarios" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" /> Everything you need to plan ahead
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              The complete forecasting platform
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From raw time-series data to boardroom-ready forecasts — every tool in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              accent
              icon={<Bot className="w-5 h-5" />}
              title="AI Forecast Copilot"
              description="Chat with your data in plain English. Ask 'What happens if demand drops 20%?' and get instant, contextual answers."
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Multi-Model Engine"
              description="Linear regression, Holt-Winters ETS, Ensemble averaging, and Auto-select — the best model is chosen automatically via cross-validated MAPE."
            />
            <FeatureCard
              icon={<GitBranch className="w-5 h-5" />}
              title="Scenario Planning"
              description="Build what-if scenarios with percentage adjustments. Compare optimistic, pessimistic, and base cases side-by-side instantly."
            />
            <FeatureCard
              icon={<Database className="w-5 h-5" />}
              title="Easy Data Ingestion"
              description="Upload CSVs or add data points via API. Auto-detects seasonality, trend direction, and series statistics on import."
            />
            <FeatureCard
              icon={<Activity className="w-5 h-5" />}
              title="Confidence Intervals"
              description="Every forecast comes with 95% confidence bands — upper and lower bounds so you can plan for best and worst cases."
            />
            <FeatureCard
              icon={<Target className="w-5 h-5" />}
              title="Accuracy Tracking"
              description="Cross-validated MAPE scoring on every run. The Auto model selector picks the lowest-error model for your specific data shape."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <LineChart className="w-3.5 h-3.5" /> Three simple steps
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              From raw data to actionable forecast in minutes
            </h2>
            <p className="text-slate-500 mb-10">
              No data science degree required. Upload, run, plan.
            </p>
            <div className="space-y-8">
              <StepCard
                number="1"
                title="Upload your time-series data"
                description="Paste a CSV or add data points via our UI. Supports demand, revenue, headcount — any numeric time series. Auto-detects seasonality and trend on import."
              />
              <StepCard
                number="2"
                title="AI picks and runs the best model"
                description="Our engine cross-validates Linear, ETS, and Ensemble models on your data. The Auto selector picks whichever gives the lowest MAPE — no manual tuning needed."
              />
              <StepCard
                number="3"
                title="Model scenarios and plan with confidence"
                description="Create optimistic, pessimistic, and custom scenarios with percentage adjustments. Export results or query the AI Copilot for narrative explanations."
              />
            </div>
          </div>

          {/* Visual: terminal-style steps */}
          <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm shadow-2xl">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-slate-500"># 1. Create a data series</p>
              <p className="text-teal-400">POST /api/v1/data-series</p>
              <p className="text-slate-300">{"{"} name: "Q4 Electronics", data_type: "demand" {"}"}</p>
              <div className="border-t border-slate-700 pt-3 mt-3">
                <p className="text-slate-500"># 2. Run AI forecast</p>
                <p className="text-teal-400">POST /api/v1/forecasts/run</p>
                <p className="text-slate-300">{"{"} model_type: "auto", horizon_months: 12 {"}"}</p>
              </div>
              <div className="border-t border-slate-700 pt-3 mt-3">
                <p className="text-slate-500"># 3. Response</p>
                <p className="text-emerald-400">{"{"}</p>
                <p className="text-slate-300 ml-4">status: <span className="text-yellow-400">"completed"</span>,</p>
                <p className="text-slate-300 ml-4">mape: <span className="text-teal-400">9.7</span>,</p>
                <p className="text-slate-300 ml-4">model_type: <span className="text-yellow-400">"linear"</span>,</p>
                <p className="text-slate-300 ml-4">forecast_points: <span className="text-teal-400">[12 points]</span></p>
                <p className="text-emerald-400">{"}"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI COPILOT SPOTLIGHT ── */}
      <section id="ai" className="py-24 bg-gradient-to-br from-slate-900 to-teal-950 relative overflow-hidden">
        <GridPattern />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Bot className="w-3.5 h-3.5" /> AI Forecast Copilot
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Your expert forecasting analyst — always available
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Ask the copilot anything about your data. It explains MAPE scores, recommends
              scenarios, interprets seasonal patterns, and suggests next actions — in plain
              English, not spreadsheet jargon.
            </p>
            <ul className="space-y-3">
              {[
                "Explains forecast accuracy in plain language",
                "Suggests scenarios based on your data patterns",
                "Recommends the right model for your series",
                "Works without an API key — built-in rule-based fallback",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 mt-8 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Try the AI Copilot <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Chat mockup */}
          <div className="bg-slate-800/70 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium text-white">AI Forecast Copilot</span>
              <span className="ml-auto text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">Online</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-end">
                <div className="bg-teal-600 text-white text-sm rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%]">
                  What does a MAPE of 9.7% mean for my forecast?
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="bg-slate-700/60 border border-slate-600 text-slate-200 text-sm rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%]">
                  A MAPE of 9.7% is excellent — it means your forecast is off by less than 10% on average. Anything under 15% is considered production-ready for demand planning.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-teal-600 text-white text-sm rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%]">
                  Should I run a pessimistic scenario?
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="bg-slate-700/60 border border-slate-600 text-slate-200 text-sm rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%]">
                  Yes — I&apos;d suggest a -15% scenario to model supply disruption risk. Your Q4 data shows volatility, so planning for downside is prudent.
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  readOnly
                  value="How do I improve accuracy further?"
                  className="flex-1 bg-slate-700/40 border border-slate-600 text-slate-400 text-xs rounded-lg px-3 py-2 cursor-default"
                />
                <button className="bg-teal-600 text-white rounded-lg px-3 py-2" aria-label="Send">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODEL COMPARISON ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Choose the right model for your data</h2>
            <p className="text-slate-500">Or use Auto — we'll pick it for you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Linear",
                badge: "Trending data",
                description: "Best for series with a clear upward or downward trend. Adds seasonal adjustment automatically.",
                color: "border-blue-200 bg-blue-50",
                badge_color: "bg-blue-100 text-blue-700",
              },
              {
                name: "ETS",
                badge: "Smooth data",
                description: "Holt-Winters exponential smoothing. Excellent for stable, slowly-changing series.",
                color: "border-purple-200 bg-purple-50",
                badge_color: "bg-purple-100 text-purple-700",
              },
              {
                name: "Ensemble",
                badge: "Most robust",
                description: "Averages Linear and ETS predictions. Reduces model-specific bias — best default choice.",
                color: "border-teal-200 bg-teal-50",
                badge_color: "bg-teal-100 text-teal-700",
              },
              {
                name: "Auto",
                badge: "Recommended",
                description: "Cross-validates all models on your data and picks whichever has the lowest MAPE. Zero configuration.",
                color: "border-emerald-200 bg-emerald-50",
                badge_color: "bg-emerald-100 text-emerald-700",
              },
            ].map((m) => (
              <div key={m.name} className={`rounded-2xl border p-5 ${m.color}`}>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.badge_color}`}>{m.badge}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2">{m.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to forecast with confidence?
          </h2>
          <p className="text-teal-100 mb-8 text-lg">
            Upload your first data series and get a 12-month AI forecast in under 60 seconds.
            No credit card, no setup — just accurate predictions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-7 py-3.5 rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
            >
              Open the app <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/data"
              className="inline-flex items-center gap-2 bg-teal-700/40 text-white font-medium px-7 py-3.5 rounded-xl border border-white/30 hover:bg-teal-700/60 transition-colors"
            >
              Upload data now
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            DClaw Forecast
          </div>
          <p className="text-sm">
            Built on the <span className="text-teal-400">DClaw Stack</span> — FastAPI · Next.js · PostgreSQL
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/ai" className="hover:text-white transition-colors">AI Copilot</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
