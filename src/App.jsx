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
      <Header />

      <main style={mainStyle}>
        <HoverCard style={overviewStyle}>
          <Overview stats={stats} gaugeRatio={gaugeRatio} />
        </HoverCard>

        <section style={statsGrid}>
          <StatCard label="Total Readings" value={stats?.count ?? "--"} icon="📊" />
          <StatCard label="Average Power (mW)" value={stats?.avg_power?.toFixed(2) ?? "--"} icon="⚡" />
          <StatCard label="Max Power (mW)" value={stats?.max_power?.toFixed(2) ?? "--"} icon="🚀" />
          <StatCard label="Min Power (mW)" value={stats?.min_power?.toFixed(2) ?? "--"} icon="🔋" />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
          <HoverCard style={graphStyle}>
            <h3>📈 Energy Output vs People</h3>
            <p style={graphDesc}>
              Graph showing how energy output varies as more people step on the tiles.
            </p>
            <img
              src="/energy-output-vs-people.png"
              alt="Energy Output vs People"
              style={graphImg}
            />
          </HoverCard>

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

/* ---------- COMPONENTS ---------- */

function HoverCard({ children, style }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...style,
        transform: hover ? "translateY(-6px)" : "none",
        boxShadow: hover
          ? "0 25px 60px rgba(16,185,129,0.45)"
          : style.boxShadow,
        transition: "all 0.25s ease",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...statCardStyle,
        transform: hover ? "translateY(-6px) scale(1.02)" : "none",
        boxShadow: hover
          ? "0 30px 70px rgba(16,185,129,0.55)"
          : statCardStyle.boxShadow,
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ fontSize: 13, color: "#a7f3d0" }}>
        {label} <span style={{ float: "right" }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PredictPanel({ form, setForm, handlePredict, prediction }) {
  return (
    <HoverCard style={predictStyle}>
      <form onSubmit={handlePredict}>
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

        <HoverButton />

        {prediction && (
          <p style={predictionStyle}>
            🔋 Predicted Power: {prediction} mW
          </p>
        )}
      </form>
    </HoverCard>
  );
}

function HoverButton() {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="submit"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...buttonStyle,
        transform: hover ? "scale(1.05)" : "scale(1)",
        boxShadow: hover
          ? "0 0 30px rgba(34,197,94,0.9)"
          : buttonStyle.boxShadow,
        transition: "all 0.2s ease",
      }}
    >
      🔍 Predict
    </button>
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

/* ---------- STYLES (UNCHANGED) ---------- */

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #16a34a22, #000000), linear-gradient(135deg,#022c22,#020617)",
  color: "#e5ffe9",
  fontFamily: "system-ui",
};

const mainStyle = { padding: 32, maxWidth: 1400, margin: "0 auto" };

const overviewStyle = {
  padding: 20,
  borderRadius: 22,
  background:
    "linear-gradient(145deg,rgba(5,46,22,0.95),rgba(16,185,129,0.15))",
  border: "1px solid rgba(52,211,153,0.5)",
  marginBottom: 24,
  boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 16,
  marginBottom: 24,
};

const statCardStyle = {
  padding: 16,
  borderRadius: 18,
  background:
    "linear-gradient(145deg,rgba(15,23,42,0.95),rgba(16,185,129,0.18))",
  border: "1px solid rgba(52,211,153,0.7)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.85)",
};

const graphStyle = {
  padding: 20,
  borderRadius: 22,
  background:
    "linear-gradient(145deg,rgba(5,46,22,0.95),rgba(16,185,129,0.12))",
  border: "1px solid rgba(52,211,153,0.5)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
};

const graphImg = {
  width: "100%",
  marginTop: 12,
  borderRadius: 12,
  boxShadow: "0 0 20px rgba(16,185,129,0.4)",
};

const graphDesc = { fontSize: 12, color: "#9ca3af", marginTop: 4 };

const predictStyle = {
  padding: 22,
  borderRadius: 22,
  background:
    "linear-gradient(145deg,rgba(5,46,22,0.95),rgba(16,185,129,0.12))",
  border: "1px solid rgba(52,211,153,0.5)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
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

const buttonStyle = {
  marginTop: 10,
  padding: "9px 14px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg, #22c55e, #4ade80, #22c55e)",
  color: "#022c22",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  width: "100%",
  boxShadow: "0 14px 30px rgba(22,163,74,0.7)",
};

const predictionStyle = {
  marginTop: 12,
  fontWeight: 700,
  fontSize: 18,
  textAlign: "center",
};
