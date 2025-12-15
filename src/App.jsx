import { useEffect, useState } from "react";

const API_BASE = "https://peizo-backend.onrender.com";

export default function App() {
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    voltage: "",
    current_uA: "",
    weight_kg: "",
    step_location: "Center",
  });
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`${API_BASE}/stats`);
        const json = await res.json();
        setStats(json);
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    }
    loadStats();
  }, []);

  async function handlePredict(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voltage: parseFloat(form.voltage),
          current_uA: parseFloat(form.current_uA),
          weight_kg: parseFloat(form.weight_kg),
          step_location: form.step_location,
        }),
      });

      const json = await res.json();
      if (json?.predicted_power_mW != null) {
        setPrediction(json.predicted_power_mW.toFixed(3));
      }
    } catch (err) {
      console.error("Prediction error:", err);
    }
  }

  const avgPower = stats?.avg_power ?? 0;
  const maxPower = stats?.max_power ?? 1;
  const gaugeRatio = Math.max(0, Math.min(1, maxPower ? avgPower / maxPower : 0));

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <div style={taglineStyle}>🌍 Sustainability · ⚡ Smart Energy</div>
          <h1 style={titleStyle}>Piezoelectric Smart Tile Dashboard</h1>
          <p style={subtitleStyle}>
            AI-powered prediction of renewable energy from footsteps.
          </p>
        </div>

        <div style={backendBadgeStyle}>
          🔌 Backend: Render (Live)
        </div>
      </header>

      <main style={mainStyle}>
        {/* OVERVIEW */}
        <section style={{ ...cardBase, ...hoverLift }}>
          <div>
            <h2 style={{ marginTop: 0 }}>♻️ Project Overview</h2>
            <p style={{ fontSize: 14, opacity: 0.9 }}>
              This dashboard predicts power output using a machine learning model
              based on <b>voltage</b>, <b>current</b>, <b>weight</b>, and{" "}
              <b>step location</b>.
            </p>
            <ul style={{ fontSize: 14, opacity: 0.9 }}>
              <li>⚡ Real-time ML prediction</li>
              <li>📊 Statistical insights</li>
              <li>🌱 Smart energy simulation</li>
            </ul>
          </div>

          {/* Gauge */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={gaugeWrapper}>
              <svg width="90" height="90" viewBox="0 0 36 36">
                <path
                  d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="3.2"
                />
                <path
                  d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.2"
                  strokeDasharray={`${100 * gaugeRatio}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={gaugeText}>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Avg Power</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {stats?.avg_power?.toFixed(2) ?? "--"} mW
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={statsGrid}>
          <StatCard label="Total Readings" value={stats?.count ?? "--"} icon="📊" />
          <StatCard label="Average Power (mW)" value={stats?.avg_power?.toFixed(2) ?? "--"} icon="⚡" />
          <StatCard label="Max Power (mW)" value={stats?.max_power?.toFixed(2) ?? "--"} icon="🚀" />
          <StatCard label="Min Power (mW)" value={stats?.min_power?.toFixed(2) ?? "--"} icon="🔋" />
        </section>

        {/* GRAPH + PREDICT */}
        <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
          <div style={{ ...cardBase, ...hoverGlow }}>
            <h3>📈 Energy Output vs People</h3>
            <img
              src="/energy-output-vs-people.png"
              alt="Energy graph"
              style={{ width: "100%", borderRadius: 12, marginTop: 10 }}
            />
          </div>

          <PredictPanel
            form={form}
            setForm={setForm}
            handlePredict={handlePredict}
            prediction={prediction}
          />
        </section>
      </main>
    </div>
  );
}

/* COMPONENTS */

function StatCard({ label, value, icon }) {
  return (
    <div style={{ ...statCard, ...hoverLift }}>
      <div style={{ fontSize: 13, color: "#a7f3d0" }}>
        {label} <span style={{ float: "right" }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PredictPanel({ form, setForm, handlePredict, prediction }) {
  return (
    <form onSubmit={handlePredict} style={{ ...cardBase, ...hoverGlow }}>
      <h3>🤖 Predict Power Output</h3>

      <Input label="Voltage (V)" value={form.voltage} onChange={(v) => setForm({ ...form, voltage: v })} />
      <Input label="Current (µA)" value={form.current_uA} onChange={(v) => setForm({ ...form, current_uA: v })} />
      <Input label="Weight (kg)" value={form.weight_kg} onChange={(v) => setForm({ ...form, weight_kg: v })} />

      <label>
        Step Location
        <select
          value={form.step_location}
          onChange={(e) => setForm({ ...form, step_location: e.target.value })}
          style={selectStyle}
        >
          <option value="Center">Center</option>
          <option value="Edge">Edge</option>
          <option value="Corner">Corner</option>
        </select>
      </label>

      <button type="submit" style={predictButton}>
        🔍 Predict
      </button>

      {prediction && (
        <p style={{ marginTop: 12, fontWeight: 700, textAlign: "center" }}>
          🔋 Predicted Power: {prediction} mW
        </p>
      )}
    </form>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label>
      {label}
      <input
        required
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

/* STYLES */

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #16a34a22, #020617)",
  color: "#e5ffe9",
  fontFamily: "system-ui",
};

const headerStyle = {
  padding: "18px 32px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "linear-gradient(90deg,#064e3b,#022c22)",
  position: "sticky",
  top: 0,
};

const taglineStyle = { fontSize: 13, letterSpacing: 2, color: "#6ee7b7" };
const titleStyle = { margin: 0, fontSize: 26 };
const subtitleStyle = { fontSize: 12, color: "#a7f3d0" };
const backendBadgeStyle = {
  padding: "6px 12px",
  borderRadius: 12,
  border: "1px solid rgba(52,211,153,0.6)",
};

const mainStyle = { padding: 32, maxWidth: 1400, margin: "0 auto" };

const cardBase = {
  padding: 22,
  borderRadius: 22,
  background: "linear-gradient(145deg,#052e16,#16a34a22)",
  border: "1px solid rgba(52,211,153,0.5)",
};

const hoverLift = {
  transition: "all 0.25s ease",
};

const hoverGlow = {
  transition: "all 0.25s ease",
};

const statCard = {
  ...cardBase,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 16,
  margin: "24px 0",
};

const inputStyle = {
  width: "100%",
  padding: 8,
  marginTop: 4,
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid rgba(52,211,153,0.9)",
  background: "#020617",
  color: "#e5ffe9",
};

const selectStyle = { ...inputStyle };

const predictButton = {
  marginTop: 12,
  width: "100%",
  padding: "10px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  background: "linear-gradient(135deg,#22c55e,#4ade80)",
  transition: "all 0.2s ease",
};

const gaugeWrapper = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  background: "radial-gradient(circle,#22c55e33,#020617)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

const gaugeText = {
  position: "absolute",
  textAlign: "center",
};
