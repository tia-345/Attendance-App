import { useState, useEffect } from "react";

const CircularProgress = ({ percentage, color = "var(--primary)" }) => {
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(Math.max(percentage || 0, 0), 100);
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="progress-container" style={{ position: "relative" }}>
      <svg className="circle-svg" width="160" height="160" viewBox="0 0 160 160">
        <circle
          className="circle-bg"
          cx="80"
          cy="80"
          r={radius}
        />
        <circle
          className="circle-bar"
          cx="80"
          cy="80"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            stroke: color
          }}
        />
      </svg>
      <div className="circle-text">
        <div className="circle-percent">{percentage || 0}%</div>
        <div className="circle-label">ATTENDANCE</div>
      </div>
    </div>
  );
};

function App() {
  const [attended, setAttended] = useState("");
  const [total, setTotal] = useState("");
  const [target, setTarget] = useState("75");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Derived Values
  const [currentPercent, setCurrentPercent] = useState(0);
  const [classesNeeded, setClassesNeeded] = useState(0);
  const [classesCanMiss, setClassesCanMiss] = useState(0);
  const [error, setError] = useState("");

  // Smart Predictions
  const [forecasts, setForecasts] = useState([]);

  // Dark Mode Toggle Support
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Calculations
  useEffect(() => {
    setError("");
    const a = Number(attended);
    const t = Number(total);
    const tgt = Number(target);

    if (t === 0) {
      setCurrentPercent(0);
      setClassesNeeded(0);
      setClassesCanMiss(0);
      return;
    }

    if (a > t) {
      setError("Attended classes cannot be more than total classes.");
      return;
    }

    const current = (a / t) * 100;
    setCurrentPercent(Number(current.toFixed(1)));

    // Needed to reach target
    if (current < tgt) {
      if (tgt === 100) {
        setClassesNeeded(Infinity);
      } else {
        const x = Math.ceil((tgt * t - 100 * a) / (100 - tgt));
        setClassesNeeded(x > 0 ? x : 0);
      }
      setClassesCanMiss(0);
    } 
    // Can miss while staying above target
    else {
      const y = Math.floor((100 * a) / tgt - t);
      setClassesCanMiss(y > 0 ? y : 0);
      setClassesNeeded(0);
    }

    // --- Smart Predictions ---
    const scenarios = [
      { type: "attend", count: 1, label: "Attend next class" },
      { type: "attend", count: 5, label: "Attend next 5 classes" },
      { type: "miss", count: 1, label: "Miss next class" },
      { type: "miss", count: 3, label: "Miss next 3 classes" }
    ];

    const results = scenarios.map(s => {
      let newA = a;
      let newT = t + s.count;
      if (s.type === "attend") {
        newA += s.count;
      }
      const pct = (newA / newT) * 100;
      return { ...s, pct: pct.toFixed(1) };
    });
    setForecasts(results);
  }, [attended, total, target]);

  const addClass = () => {
    setAttended(prev => (Number(prev) + 1).toString());
    setTotal(prev => (Number(prev) + 1).toString());
  };

  const resetAll = () => {
    setAttended("");
    setTotal("");
    setTarget("75");
  };

  return (
    <div className="container">
      <header>
        <h1>MyAttend</h1>
        <button 
          className="theme-toggle" 
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <main>
        <div className="card">
          <CircularProgress percentage={currentPercent} />

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Attended</div>
              <div className="stat-value">{attended || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Conducted</div>
              <div className="stat-value">{total || 0}</div>
            </div>
          </div>

          <div className="input-section">
            <div className="input-group">
              <label>Attended Classes</label>
              <input 
                type="number" 
                value={attended}
                onChange={(e) => setAttended(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <div className="input-group">
              <label>Total Conducted Classes</label>
              <input 
                type="number" 
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="e.g. 15"
              />
            </div>
            <div className="input-group">
              <label>Target Percentage (%)</label>
              <input 
                type="number" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 75"
              />
            </div>
          </div>

          {error && (
            <div className="result-box danger" style={{ marginTop: "20px" }}>
              <div className="result-desc">{error}</div>
            </div>
          )}

          {!error && total > 0 && (
            currentPercent < target ? (
              <div className="result-box danger">
                <div className="result-title">Classes Needed</div>
                <div className="result-value">
                  {classesNeeded === Infinity ? "∞" : classesNeeded}
                </div>
                <div className="result-desc">
                  Attend the next {classesNeeded === Infinity ? "all" : classesNeeded} classes to reach {target}%
                </div>
              </div>
            ) : (
              <div className="result-box">
                <div className="result-title">Safe Margin</div>
                <div className="result-value">{classesCanMiss}</div>
                <div className="result-desc">
                  You can safely miss the next {classesCanMiss} classes
                </div>
              </div>
            )
          )}

          {/* SMART PREDICTIONS SECTION */}
          {!error && total > 0 && (
            <div className="forecast-section">
              <div className="forecast-title">Quick Forecast</div>
              <div className="forecast-list">
                {forecasts.map((f, idx) => (
                  <div key={idx} className={`forecast-item ${f.type}`}>
                    <span className="forecast-label">{f.label}</span>
                    <span className="forecast-value">{f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="reset-btn" onClick={resetAll}>Reset Dashboard</button>
        </div>
      </main>

      <button className="fab" onClick={addClass} title="Mark Attend">+1</button>
    </div>
  );
}

export default App;
