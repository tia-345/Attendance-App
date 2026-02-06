import { useState } from "react";

/* ===== CIRCULAR CHART ===== */
const CircularChart = ({ value }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="circle-container">
      <div className="circle-chart">
        <svg width="140" height="140">
          <circle className="circle-bg" cx="70" cy="70" r={radius} />
          <circle
            className="circle-progress"
            cx="70"
            cy="70"
            r={radius}
            style={{ "--offset": offset }}
          />
        </svg>

        <div className="circle-text">
          <span>{value}%</span>
          <small>Final</small>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [attended, setAttended] = useState("");
  const [conducted, setConducted] = useState("");
  const [remaining, setRemaining] = useState("");
  const [target, setTarget] = useState("");
  const [planned, setPlanned] = useState("");

  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [finalAttendance, setFinalAttendance] = useState(null);
  const [bestCaseAttendance, setBestCaseAttendance] = useState(null);
  const [worstCaseAttendance, setWorstCaseAttendance] = useState(null);
  const [minRequired, setMinRequired] = useState(null);

  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  const calculateAttendance = () => {
    setError("");
    setCurrentAttendance(null);
    setFinalAttendance(null);
    setBestCaseAttendance(null);
    setWorstCaseAttendance(null);
    setMinRequired(null);
    setStatus("");
    setMessage("");

    if (
      attended === "" ||
      conducted === "" ||
      remaining === "" ||
      target === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const a = Number(attended);
    const c = Number(conducted);
    const r = Number(remaining);
    const t = Number(target);
    const p = planned === "" ? null : Number(planned);

    if (a > c || c === 0 || (p !== null && p > r)) {
      setError("Invalid attendance values.");
      return;
    }

    /* CURRENT ATTENDANCE (informational) */
    const current = (a / c) * 100;
    setCurrentAttendance(current.toFixed(2));

    /* BEST & WORST CASE */
    const best = ((a + r) / (c + r)) * 100;
    const worst = (a / (c + r)) * 100;
    setBestCaseAttendance(best.toFixed(2));
    setWorstCaseAttendance(worst.toFixed(2));

    /* MINIMUM REQUIRED CLASSES */
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
    if (p !== null) {
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
  };

  const resetAll = () => {
    setAttended("");
    setConducted("");
    setRemaining("");
    setTarget("");
    setPlanned("");
    setCurrentAttendance(null);
    setFinalAttendance(null);
    setBestCaseAttendance(null);
    setWorstCaseAttendance(null);
    setMinRequired(null);
    setStatus("");
    setMessage("");
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

            <label>
              Classes Attended
              <input
                type="number"
                value={attended}
                onChange={(e) => setAttended(e.target.value)}
              />
            </label>

            <label>
              Classes Conducted
              <input
                type="number"
                value={conducted}
                onChange={(e) => setConducted(e.target.value)}
              />
            </label>

            <label>
              Remaining Classes
              <input
                type="number"
                value={remaining}
                onChange={(e) => setRemaining(e.target.value)}
              />
            </label>

            <label>
              Target Attendance (%)
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>

            <label>
              Planned Attendance (What-If)
              <input
                type="number"
                value={planned}
                onChange={(e) => setPlanned(e.target.value)}
              />
            </label>

            <button className="primary" onClick={calculateAttendance}>
              Run Analysis
            </button>

            <button className="secondary" onClick={resetAll}>
              Reset
            </button>

            {error && <p className="warning">{error}</p>}
          </div>

          {/* OUTCOME */}
          <div className="section">
            <div className="section-title">Outcome</div>

            {currentAttendance && (
              <>
                <div className="metrics">
                  <div className="metric">
                    <div className="metric-title">Current</div>
                    <div className="metric-value">
                      {currentAttendance}%
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-title">Best Case</div>
                    <div className="metric-value">
                      {bestCaseAttendance}%
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-title">Worst Case</div>
                    <div className="metric-value">
                      {worstCaseAttendance}%
                    </div>
                  </div>
                </div>

                {minRequired !== null ? (
                  <p className="info">
                    You need to attend at least{" "}
                    <strong>{minRequired}</strong> more classes to reach{" "}
                    <strong>{target}%</strong> attendance.
                  </p>
                ) : (
                  <p className="info warning">
                    Even attending all future classes will not reach the target.
                  </p>
                )}

                {finalAttendance && (
                  <>
                    <CircularChart value={finalAttendance} />
                    <div className={`status ${status.toLowerCase()}`}>
                      Status: {status}
                    </div>
                    <p className="info">{message}</p>
                  </>
                )}
              </>
            )}

            <button
              className="secondary"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? "Hide Logic" : "Show Calculation Logic"}
            </button>

            {showExplanation && (
              <div className="explanation">
                <p>
                  Minimum required classes are calculated independently of
                  what-if planning.
                </p>
                <p>
                  Final attendance is calculated only when a what-if plan is
                  provided.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
