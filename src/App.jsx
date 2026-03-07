import { useState, useEffect } from "react";

/* ===== NEW DONUT CHART ===== */
const DonutChart = ({ attended, conducted, percentage }) => {
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Ensure value doesn't exceed 100 to avoid negative offset
  const safePercent = percentage > 100 ? 100 : percentage;
  const offset = circumference - (safePercent / 100) * circumference;

  const missed = conducted - attended;

  return (
    <div className="current-chart-container">
      <div className="donut-chart">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle
            className="donut-bg"
            cx="80"
            cy="80"
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="donut-progress"
            cx="80"
            cy="80"
            r={radius}
            strokeWidth={strokeWidth}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset
            }}
          />
        </svg>

        <div className="donut-text">
          <span className="percentage">{percentage}%</span>
          <small>Current</small>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="color-box attended-color"></span>
          <div>
            <div className="legend-value">{attended}</div>
            <div className="legend-label">Attended</div>
          </div>
        </div>
        <div className="legend-item">
          <span className="color-box missed-color"></span>
          <div>
            <div className="legend-value">{missed > 0 ? missed : 0}</div>
            <div className="legend-label">Lost/Missed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== SMALLER FINAL CHART ===== */
const FinalCircularChart = ({ value }) => {
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const safeValue = value > 100 ? 100 : value;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="circular-chart-final" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
      <div className="donut-chart" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            className="donut-bg"
            cx="60" cy="60"
            r={radius}
            strokeWidth={strokeWidth}
            stroke="#e1e7db"
          />
          <circle
            className="donut-progress"
            cx="60" cy="60"
            r={radius}
            strokeWidth={strokeWidth}
            stroke="var(--accent-secondary)"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset
            }}
          />
        </svg>
        <div className="donut-text">
          <span className="percentage" style={{ fontSize: "24px" }}>{value}%</span>
          <small style={{ fontSize: "10px" }}>What-If</small>
        </div>
      </div>
    </div>
  );
};


function App() {
  const [attended, setAttended] = useState("");
  const [conducted, setConducted] = useState("");
  const [remaining, setRemaining] = useState(""); // optional
  const [target, setTarget] = useState("75"); // default target 75%
  const [planned, setPlanned] = useState(""); // optional

  // Results
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [classesNeeded, setClassesNeeded] = useState(null);
  const [classesCanMiss, setClassesCanMiss] = useState(null);

  const [finalAttendance, setFinalAttendance] = useState(null);
  const [bestCaseAttendance, setBestCaseAttendance] = useState(null);
  const [worstCaseAttendance, setWorstCaseAttendance] = useState(null);
  const [minRequired, setMinRequired] = useState(null);

  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    calculateAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attended, conducted, remaining, target, planned]);

  const calculateAttendance = () => {
    setError("");
    setCurrentAttendance(null);
    setClassesNeeded(null);
    setClassesCanMiss(null);
    setFinalAttendance(null);
    setBestCaseAttendance(null);
    setWorstCaseAttendance(null);
    setMinRequired(null);
    setStatus("");
    setMessage("");

    if (attended === "" || conducted === "" || target === "") {
      return; // Wait for basic inputs
    }

    const a = Number(attended);
    const c = Number(conducted);
    const t = Number(target);

    if (a < 0 || c <= 0 || a > c || t <= 0 || t > 100) {
      if (a > c) setError("Attended classes cannot be greater than conducted.");
      else if (c <= 0) setError("Conducted classes must be > 0.");
      else setError("Valid positive numbers required.");
      return;
    }

    /* CURRENT ATTENDANCE (informational) */
    const current = (a / c) * 100;
    setCurrentAttendance(current.toFixed(2));

    /* CONSECUTIVE CLASSES LOGIC */
    if (current < t) {
      if (t === 100) {
        setClassesNeeded(Infinity);
      } else {
        const requiredToAttend = Math.ceil((t * c - 100 * a) / (100 - t));
        setClassesNeeded(requiredToAttend > 0 ? requiredToAttend : 0);
      }
    } else {
      const canMiss = Math.floor((100 * a) / t - c);
      setClassesCanMiss(canMiss >= 0 ? canMiss : 0);
    }

    /* ADVANCED LOGIC (If Remaining is provided) */
    if (remaining !== "") {
      const r = Number(remaining);
      if (r < 0) {
        setError("Remaining classes cannot be negative.");
        return;
      }

      /* BEST & WORST CASE */
      const best = ((a + r) / (c + r)) * 100;
      const worst = (a / (c + r)) * 100;
      setBestCaseAttendance(best.toFixed(2));
      setWorstCaseAttendance(worst.toFixed(2));

      /* MINIMUM REQUIRED CLASSES OUT OF REMAINING */
      let required = null;
      for (let i = 0; i <= r; i++) {
        const pct = ((a + i) / (c + r)) * 100;
        if (pct >= t) {
          required = i;
          break;
        }
      }
      setMinRequired(required);

      /* WHAT-IF (OPTIONAL) */
      if (planned !== "") {
        const p = Number(planned);

        if (p < 0 || p > r) {
          setError("Planned attendance must be between 0 and remaining classes.");
          return;
        }

        const final = ((a + p) / (c + r)) * 100;
        setFinalAttendance(final.toFixed(2));

        if (final >= t + 5) setStatus("SAFE");
        else if (final >= t) setStatus("RISK");
        else setStatus("DANGER");

        setMessage(
          final >= t
            ? `With your plan to attend ${p} more classes, you will meet the target.`
            : `With this plan, you will not meet the target. Increase planned attendance.`
        );
      }
    }
  };

  const resetAll = () => {
    setAttended("");
    setConducted("");
    setRemaining("");
    setTarget("75");
    setPlanned("");
    setError("");
    setShowExplanation(false);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Attendance Planner</h1>

        <div className="dashboard">
          {/* INPUTS */}
          <div className="section">
            <div className="section-title">Inputs</div>

            <div className="input-grid">
              <label>
                Attended *
                <input
                  type="number"
                  value={attended}
                  min="0"
                  onChange={(e) => setAttended(e.target.value)}
                  placeholder="e.g. 10"
                />
              </label>

              <label>
                Conducted *
                <input
                  type="number"
                  value={conducted}
                  min="1"
                  onChange={(e) => setConducted(e.target.value)}
                  placeholder="e.g. 15"
                />
              </label>
            </div>

            <label className="input-full">
              Target Attendance (%) *
              <input
                type="number"
                value={target}
                min="1"
                max="100"
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>

            <details className="optional-inputs">
              <summary>Advanced Planning (Optional)</summary>
              <div className="details-content">
                <label>
                  Remaining Classes
                  <input
                    type="number"
                    value={remaining}
                    min="0"
                    onChange={(e) => setRemaining(e.target.value)}
                    placeholder="e.g. 5"
                  />
                </label>

                <label>
                  Planned Attendance (What-If)
                  <input
                    type="number"
                    value={planned}
                    min="0"
                    onChange={(e) => setPlanned(e.target.value)}
                    placeholder="e.g. 3"
                    disabled={remaining === ""}
                    title={remaining === "" ? "Enter remaining classes first" : ""}
                  />
                </label>
              </div>
            </details>

            <button className="secondary" onClick={resetAll} style={{ marginTop: "20px" }}>
              Reset Everything
            </button>

            {error && (
              <div className="info-box danger" style={{ marginTop: "16px" }}>
                <p className="info">{error}</p>
              </div>
            )}
          </div>

          {/* OUTCOME */}
          <div className="section">
            <div className="section-title">Outcome</div>

            {currentAttendance ? (
              <>
                <DonutChart
                  attended={Number(attended)}
                  conducted={Number(conducted)}
                  percentage={currentAttendance}
                />

                {remaining !== "" && bestCaseAttendance && (
                  <div className="metrics">
                    <div className="metric">
                      <div className="metric-title">Best Case</div>
                      <div className="metric-value">{bestCaseAttendance}%</div>
                    </div>
                    <div className="metric">
                      <div className="metric-title">Worst Case</div>
                      <div className="metric-value">{worstCaseAttendance}%</div>
                    </div>
                  </div>
                )}

                {/* BASIC LOGIC (No remaining specified or general advice) */}
                {classesNeeded !== null && classesNeeded > 0 && classesNeeded !== Infinity && (
                  <div className="highlight-box warning">
                    <div className="highlight-title">Action Required</div>
                    <div className="highlight-value">{classesNeeded}</div>
                    <div className="highlight-desc">
                      More consecutive classes needed to reach <strong>{target}%</strong>
                    </div>
                  </div>
                )}
                {classesNeeded === Infinity && (
                  <div className="info-box danger">
                    <p className="info">
                      You cannot reach <strong>100%</strong> attendance because you have already missed a class.
                    </p>
                  </div>
                )}
                {classesCanMiss !== null && classesCanMiss > 0 && (
                  <div className="highlight-box success">
                    <div className="highlight-title">Safe Margin</div>
                    <div className="highlight-value">{classesCanMiss}</div>
                    <div className="highlight-desc">
                      Consecutive classes you can safely miss and stay at or above <strong>{target}%</strong>
                    </div>
                  </div>
                )}
                {classesCanMiss === 0 && (
                  <div className="info-box warning">
                    <p className="info">
                      You are exactly on target. <strong>Don't miss the next class!</strong>
                    </p>
                  </div>
                )}

                {/* ADVANCED LOGIC (If Remaining is specified) */}
                {remaining !== "" && minRequired !== null && (
                  <div className="info-box">
                    <p className="info">
                      Out of the {remaining} remaining classes, you need to attend at least <strong>{minRequired}</strong> classes to reach <strong>{target}%</strong>.
                    </p>
                  </div>
                )}

                {remaining !== "" && minRequired === null && (
                  <div className="info-box danger">
                    <p className="info">
                      Even if you attend all <strong>{remaining}</strong> remaining classes, you will not reach <strong>{target}%</strong>.
                    </p>
                  </div>
                )}

                {finalAttendance && (
                  <div style={{ marginTop: "16px", background: "#fdfdfc", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <FinalCircularChart value={finalAttendance} />
                    <div className={`status ${status.toLowerCase()}`} style={{ display: "block", width: "100%" }}>
                      Status: {status}
                    </div>
                    <p className="info" style={{ textAlign: "center", marginTop: "12px" }}>{message}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="info-box">
                <p className="info">Enter your attended and conducted classes to see your current attendance and progress.</p>
              </div>
            )}

            <button
              className="secondary"
              onClick={() => setShowExplanation(!showExplanation)}
              style={{ marginTop: "1rem" }}
            >
              {showExplanation ? "Hide Logic" : "Show Calculation Logic"}
            </button>

            {showExplanation && (
              <div className="explanation">
                <ul>
                  <li>Basic calculation tells you how many consecutive classes you need to attend to cross the target.</li>
                  <li>Advanced planning allows you to enter total remaining classes and play what-if scenarios.</li>
                  <li>Final attendance is only shown when you provide Advanced Planning details.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
