import { Link, Route, Routes, useLocation } from "react-router-dom";
import AnalysisHistory from "./pages/AnalysisHistory";
import AnalysisResults from "./pages/AnalysisResults";
import ContractAnalyzer from "./pages/ContractAnalyzer";
import HealthCheck from "./pages/HealthCheck";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/analyze", label: "Analyze" },
  { path: "/history", label: "History" },
];

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <svg
                className="w-4.5 h-4.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              ContractGuard
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Routes>
            <Route
              path="/"
              element={
                <div className="animate-fade-in flex flex-col items-center pt-16 pb-20">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-8 shadow-lg shadow-primary-500/20">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight text-center mb-4">
                    Contract Dispute Analyzer
                  </h1>
                  <p className="text-lg text-slate-500 max-w-xl text-center leading-relaxed mb-10">
                    AI-powered analysis to identify potentially disputable
                    clauses — ambiguous language, vague timeframes, undefined
                    terms, and more.
                  </p>
                  <Link
                    to="/analyze"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white rounded-xl text-base font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/25"
                  >
                    Analyze a Contract
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                  <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
                    {[
                      {
                        icon: "🔍",
                        title: "Detect Risks",
                        desc: "Find ambiguous or unfair clauses instantly",
                      },
                      {
                        icon: "📝",
                        title: "Get Suggestions",
                        desc: "AI-generated revision recommendations",
                      },
                      {
                        icon: "📊",
                        title: "Risk Scoring",
                        desc: "Quantified risk assessment at a glance",
                      },
                    ].map((f) => (
                      <div
                        key={f.title}
                        className="text-center p-5 rounded-xl bg-white border border-slate-200/60 shadow-sm"
                      >
                        <span className="text-2xl">{f.icon}</span>
                        <h3 className="text-sm font-semibold text-slate-900 mt-2">
                          {f.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />
            <Route path="/analyze" element={<ContractAnalyzer />} />
            <Route path="/results/:id" element={<AnalysisResults />} />
            <Route path="/history" element={<AnalysisHistory />} />
            <Route path="/health" element={<HealthCheck />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-6">
        <p className="text-center text-xs text-slate-400">
          ContractGuard &mdash; AI-powered contract analysis
        </p>
      </footer>
    </div>
  );
}

export default App;
