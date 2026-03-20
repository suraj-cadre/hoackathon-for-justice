import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ContractAnalyzer from './pages/ContractAnalyzer';
import AnalysisResults from './pages/AnalysisResults';
import AnalysisHistory from './pages/AnalysisHistory';
import HealthCheck from './pages/HealthCheck';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/analyze', label: 'Analyze' },
  { path: '/history', label: 'History' },
];

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-700">
            Contract Analyzer
          </Link>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-3xl mx-auto text-center py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Contract Dispute Analyzer
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  AI-powered analysis to identify potentially disputable clauses
                  in your contracts — ambiguous language, vague timeframes,
                  undefined terms, and more.
                </p>
                <Link
                  to="/analyze"
                  className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Analyze a Contract
                </Link>
              </div>
            }
          />
          <Route path="/analyze" element={<ContractAnalyzer />} />
          <Route path="/results/:id" element={<AnalysisResults />} />
          <Route path="/history" element={<AnalysisHistory />} />
          <Route path="/health" element={<HealthCheck />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
