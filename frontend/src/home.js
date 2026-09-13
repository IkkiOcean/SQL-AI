import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import "./home.css";

/* ─────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────── */
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const CHART_COLORS = [
  "#FF4D1C", "#FF7A00", "#FF9A3C", "#FFB347",
  "#E53935", "#FF6B35", "#F7931E", "#FFCD00",
];

function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

function detectChartType(columns, rows) {
  if (!rows || rows.length === 0 || columns.length < 2) return null;
  const numericCols = columns.filter((_, ci) =>
    rows.every((r) => isNumeric(r[ci]))
  );
  if (numericCols.length === 0) return null;
  const labelCol = columns.find((_, ci) =>
    rows.some((r) => !isNumeric(r[ci]))
  );
  if (!labelCol) return null;
  if (rows.length <= 6 && numericCols.length === 1) return "pie";
  if (rows.length <= 12) return "bar";
  return "area";
}

function buildChartData(columns, rows) {
  return rows.map((row) => {
    const obj = {};
    columns.forEach((col, ci) => {
      obj[col] = isNumeric(row[ci]) ? parseFloat(row[ci]) : row[ci];
    });
    return obj;
  });
}

function formatNumber(n) {
  if (typeof n !== "number") return n;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (n % 1 !== 0) return `$${n.toFixed(2)}`;
  return n.toString();
}

/* ─────────────────────────────────────────────
   CHART COMPONENT
───────────────────────────────────────────── */
function SmartChart({ columns, rows }) {
  const type = detectChartType(columns, rows);
  if (!type) return null;

  const data = buildChartData(columns, rows);
  const labelKey = columns.find((_, ci) => rows.some((r) => !isNumeric(r[ci])));
  const valueKeys = columns.filter((c) => c !== labelKey && rows.every((r, ri) => isNumeric(rows[ri][columns.indexOf(c)])));

  const tickStyle = { fill: "#9ca3af", fontSize: 11, fontFamily: "Inter, sans-serif" };
  const gridStyle = { stroke: "rgba(255,255,255,0.05)" };

  if (type === "pie") {
    const vk = valueKeys[0];
    return (
      <div className="chart-container">
        <div className="chart-label-row">
          <span className="chart-type-badge">◉ Distribution Chart</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey={vk}
              nameKey={labelKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={55}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,77,28,0.3)", borderRadius: 8, color: "#fff", fontFamily: "Inter" }}
              formatter={(val) => [formatNumber(val), vk]}
            />
            <Legend
              formatter={(val) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{val}</span>}
              wrapperStyle={{ paddingTop: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div className="chart-container">
        <div className="chart-label-row">
          <span className="chart-type-badge">▬ Bar Analysis</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
            <XAxis dataKey={labelKey} tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
            <RechartsTooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,77,28,0.3)", borderRadius: 8, color: "#fff", fontFamily: "Inter" }}
              formatter={(val, name) => [formatNumber(val), name]}
            />
            {valueKeys.map((vk, i) => (
              <Bar key={vk} dataKey={vk} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // area
  return (
    <div className="chart-container">
      <div className="chart-label-row">
        <span className="chart-type-badge">∿ Trend Analysis</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <defs>
            {valueKeys.map((vk, i) => (
              <linearGradient key={vk} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
          <XAxis dataKey={labelKey} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
          <RechartsTooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,77,28,0.3)", borderRadius: 8, color: "#fff", fontFamily: "Inter" }}
            formatter={(val, name) => [formatNumber(val), name]}
          />
          {valueKeys.map((vk, i) => (
            <Area
              key={vk}
              type="monotone"
              dataKey={vk}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              fill={`url(#grad-${i})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TYPING ANIMATION
───────────────────────────────────────────── */
function TypedText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <span>{displayed}</span>;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const Home = () => {
  const [step, setStep] = useState("connect"); // 'connect' | 'query'
  const [connectionType, setConnectionType] = useState("sample");
  const [customMode, setCustomMode] = useState("creds"); // 'creds' | 'uri'
  const [formData, setFormData] = useState({ username: "", password: "", hostname: "", db_name: "" });
  const [sqlLink, setSqlLink] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connInfo, setConnInfo] = useState({ name: "", tables: [], isSample: true });
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("summary"); // 'summary' | 'sql' | 'table' | 'chart'
  const [showSidebar, setShowSidebar] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/sample-info`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") {
          setConnInfo({ name: d.db_type, tables: d.tables || [], isSample: true });
          setSampleQuestions(d.sample_questions || []);
        }
      })
      .catch(() => {});
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleConnect = () => {
    setConnecting(true);
    setError("");

    if (connectionType === "upload") {
      if (!selectedFile) {
        setError("Please select a file (.db, .sqlite, .csv) to upload.");
        setConnecting(false);
        return;
      }
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("session_id", "default");

      fetch(`${API}/upload-db`, { method: "POST", body: data })
        .then((r) => r.json())
        .then((d) => {
          setConnecting(false);
          if (d.status === "success") {
            setConnInfo({ name: `Uploaded: ${d.filename}`, tables: d.tables || [], isSample: false });
            setStep("query");
            setTimeout(() => inputRef.current?.focus(), 100);
          } else {
            setError(d.message || "File processing failed.");
          }
        })
        .catch(() => {
          setConnecting(false);
          setError("Cannot reach backend. Is Flask running?");
        });
      return;
    }

    const payload = { type: connectionType, session_id: "default" };
    if (connectionType === "custom") {
      if (customMode === "creds") {
        if (!formData.hostname || !formData.username || !formData.db_name) {
          setError("Please fill in Host, Username, and Database Name.");
          setConnecting(false);
          return;
        }
        payload.form_data = formData;
        payload.sql_link = "";
      } else {
        if (!sqlLink.trim()) { setError("Please enter a valid connection URI."); setConnecting(false); return; }
        payload.sql_link = sqlLink.trim();
        payload.form_data = null;
      }
    }
    fetch(`${API}/connect`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then((r) => r.json())
      .then((d) => {
        setConnecting(false);
        if (d.status === "success") {
          setConnInfo({ name: d.is_sample ? "E-Commerce Sample DB" : "Custom Database", tables: d.tables || [], isSample: d.is_sample });
          setStep("query");
          setTimeout(() => inputRef.current?.focus(), 100);
        } else {
          setError(d.message || "Connection failed.");
        }
      })
      .catch(() => { setConnecting(false); setError("Cannot reach backend at localhost:5000. Is the Flask server running?"); });
  };

  const handleAsk = (q) => {
    const question = q !== undefined ? q : query;
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab("summary");
    fetch(`${API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: question.trim(), session_id: "default" }) })
      .then((r) => r.json())
      .then((d) => {
        setLoading(false);
        if (d.status === "success") {
          setResult(d);
          const hasChart = detectChartType(d.columns || [], d.rows || []);
          if (hasChart) setActiveTab("chart");
          else setActiveTab("summary");
        } else if (d.status === "security_block") {
          setError("🛡 Security Guardrail: " + d.message);
        } else {
          setError(d.message || "An error occurred.");
        }
      })
      .catch(() => { setLoading(false); setError("Network error. Please check your backend connection."); });
  };

  const copySql = () => {
    if (result?.sql) { navigator.clipboard.writeText(result.sql); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const hasChart = result && detectChartType(result.columns || [], result.rows || []);

  /* ─── CONNECT SCREEN ─── */
  if (step === "connect") {
    return (
      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-brand">
            <img src="/logo.png" alt="SQL-AI Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
            <span className="brand-name">SQL<span className="brand-accent">-AI</span></span>
          </div>
          <div className="nav-links">
            <span className="nav-pill">Natural Language · SQL · Analytics</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="connect-hero">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="hero-content">
            <div className="hero-eyebrow">Powered by Gemini AI</div>
            <h1 className="hero-heading">
              Ask Your Database<br />
              <span className="hero-gradient">in Plain English</span>
            </h1>
            <p className="hero-sub">
              Connect any SQL database or upload dataset files (.sqlite, .db, .csv).<br />
              Get instant SQL, data tables, charts, and AI-generated insights.
            </p>

            {/* Connect Card */}
            <div className="connect-card">
              {/* Tabs */}
              <div className="tab-row">
                <button
                  className={`tab-btn ${connectionType === "sample" ? "active" : ""}`}
                  onClick={() => setConnectionType("sample")}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1C4.24 1 2 2.12 2 3.5V10.5C2 11.88 4.24 13 7 13C9.76 13 12 11.88 12 10.5V3.5C12 2.12 9.76 1 7 1Z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 3.5C2 4.88 4.24 6 7 6C9.76 6 12 4.88 12 3.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 7C2 8.38 4.24 9.5 7 9.5C9.76 9.5 12 8.38 12 7" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Sample DB
                  <span className="tab-badge">Instant</span>
                </button>
                <button
                  className={`tab-btn ${connectionType === "upload" ? "active" : ""}`}
                  onClick={() => setConnectionType("upload")}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 9V2M7 2L4 5M7 2L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 10V11.5C2 12.05 2.45 12.5 3 12.5H11C11.55 12.5 12 12.05 12 11.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Upload File
                  <span className="tab-badge">Kaggle / CSV</span>
                </button>
                <button
                  className={`tab-btn ${connectionType === "custom" ? "active" : ""}`}
                  onClick={() => setConnectionType("custom")}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M7 4.5V7L8.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Custom Server
                </button>
              </div>

              {connectionType === "sample" ? (
                <div className="sample-info-box">
                  <div className="sample-db-grid">
                    {["customers", "orders", "order_items", "products", "categories"].map((t) => (
                      <div key={t} className="db-table-chip">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" stroke="#FF4D1C" strokeWidth="1" />
                          <path d="M0.5 3.5H9.5" stroke="#FF4D1C" strokeWidth="0.8" />
                          <path d="M0.5 6H9.5" stroke="#FF4D1C" strokeWidth="0.8" />
                        </svg>
                        {t}
                      </div>
                    ))}
                  </div>
                  <p className="sample-desc">
                    A realistic e-commerce database with customers, orders, products, and revenue data — ready to query immediately.
                  </p>
                </div>
              ) : connectionType === "upload" ? (
                <div className="upload-box">
                  <label className="upload-dropzone">
                    <input
                      type="file"
                      accept=".db,.sqlite,.sqlite3,.csv"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8, color: "#FF4D1C" }}>
                      <path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 16V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="upload-title">
                      {selectedFile ? selectedFile.name : "Click to select or drop dataset file"}
                    </span>
                    <span className="upload-sub">Supports Kaggle SQLite (.db, .sqlite) & CSV files</span>
                  </label>
                </div>
              ) : (
                <div className="custom-form">
                  <div className="radio-row">
                    <label className={`radio-opt ${customMode === "creds" ? "active" : ""}`}>
                      <input type="radio" checked={customMode === "creds"} onChange={() => setCustomMode("creds")} />
                      MySQL Credentials
                    </label>
                    <label className={`radio-opt ${customMode === "uri" ? "active" : ""}`}>
                      <input type="radio" checked={customMode === "uri"} onChange={() => setCustomMode("uri")} />
                      Connection URI
                    </label>
                  </div>
                  {customMode === "creds" ? (
                    <div className="creds-grid">
                      {[["Host", "hostname", "localhost"], ["Database", "db_name", "mydb"], ["Username", "username", "root"], ["Password", "password", ""]].map(([label, key, ph]) => (
                        <div key={key} className="field-wrap">
                          <label className="field-label">{label}</label>
                          <input
                            className="field-input"
                            placeholder={ph}
                            type={key === "password" ? "password" : "text"}
                            value={formData[key]}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="field-wrap">
                      <label className="field-label">Connection URI</label>
                      <input
                        className="field-input full"
                        placeholder="sqlite:///data.db  or  mysql+pymysql://user:pass@localhost/db"
                        value={sqlLink}
                        onChange={(e) => setSqlLink(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {error && <div className="error-banner">{error}</div>}

              <button className="connect-btn" onClick={handleConnect} disabled={connecting}>
                {connecting ? (
                  <><span className="spinner" /><span>Processing Database…</span></>
                ) : (
                  <><span>{connectionType === "sample" ? "Launch with Sample Database" : connectionType === "upload" ? "Load Uploaded Dataset" : "Connect Database"}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── QUERY WORKSPACE ─── */
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar workspace-nav">
        <div className="nav-brand">
          <img src="/logo.png" alt="SQL-AI Logo" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
          <span className="brand-name">SQL<span className="brand-accent">-AI</span></span>
        </div>
        <div className="nav-center">
          <div className="query-bar-wrap">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="search-icon">
              <circle cx="7" cy="7" r="5" stroke="#6b7280" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              className="nav-query-input"
              placeholder="Ask a question about your database…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
            />
            <button className="run-btn" onClick={() => handleAsk()} disabled={loading}>
              {loading ? <span className="spinner sm" /> : <>Run <span className="kbd">↵</span></>}
            </button>
          </div>
        </div>
        <div className="nav-right">
          <div className="conn-status">
            <span className="status-dot" />
            <span>{connInfo.name}</span>
          </div>
          <button className="icon-btn" onClick={() => setStep("connect")} title="Switch database">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8C2 4.69 4.69 2 8 2C10.1 2 11.95 3.07 13.05 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 8C14 11.31 11.31 14 8 14C5.9 14 4.05 12.93 2.95 11.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13.05 1.5L13.05 5L9.55 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.95 11L2.95 14.5L6.45 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="icon-btn" onClick={() => setShowSidebar(v => !v)} title="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5.5 2V14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Workspace */}
      <div className={`workspace ${showSidebar ? "with-sidebar" : ""}`}>
        {/* Sidebar */}
        {showSidebar && (
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-heading">Schema</div>
              <div className="schema-list">
                {connInfo.tables.map((t) => (
                  <div key={t} className="schema-item">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="0.5" y="0.5" width="11" height="11" rx="2" stroke="#4b5563" />
                      <path d="M0.5 4H11.5" stroke="#4b5563" />
                      <path d="M0.5 7.5H11.5" stroke="#4b5563" />
                    </svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {connInfo.isSample && sampleQuestions.length > 0 && (
              <div className="sidebar-section">
                <div className="sidebar-heading">Quick Insights</div>
                <div className="prompt-list">
                  {sampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      className="prompt-card"
                      onClick={() => { setQuery(q.question); handleAsk(q.question); }}
                    >
                      <span className="prompt-cat">{q.category}</span>
                      <span className="prompt-q">{q.question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Main panel */}
        <main className="main-panel">
          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-orb" />
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="19" stroke="rgba(255,77,28,0.3)" strokeWidth="1.5" />
                  <path d="M13 15h14M13 20h14M13 25h9" stroke="rgba(255,77,28,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="empty-title">Start Querying</h2>
              <p className="empty-sub">Type a question in the search bar above, or pick a suggested prompt from the left.</p>
              {connInfo.isSample && (
                <div className="example-chips">
                  {["Total revenue?", "Top 5 customers?", "Best selling category?"].map((ex) => (
                    <button key={ex} className="ex-chip" onClick={() => { setQuery(ex); handleAsk(ex); }}>
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loader-ring" />
              <p className="loader-text">Generating SQL → Executing → Synthesizing insight…</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-panel">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M10 6V10M10 14h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
              <button className="dismiss-btn" onClick={() => setError("")}>✕</button>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              {/* Result header with tabs */}
              <div className="result-header">
                <div className="result-meta">
                  <span className="result-rows">{result.total_rows} {result.total_rows === 1 ? "record" : "records"}</span>
                  <span className="meta-dot">·</span>
                  <span className="result-time">{result.execution_time_sec}s</span>
                  <span className="meta-dot">·</span>
                  <span className="result-model">gemini-2.5-flash-lite</span>
                </div>
                <div className="result-tabs">
                  {hasChart && (
                    <button className={`rtab ${activeTab === "chart" ? "active" : ""}`} onClick={() => setActiveTab("chart")}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.5" y="5.5" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="5" y="2.5" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="9.5" y="0.5" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" /></svg>
                      Chart
                    </button>
                  )}
                  <button className={`rtab ${activeTab === "summary" ? "active" : ""}`} onClick={() => setActiveTab("summary")}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3h9M2 6.5h7M2 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    Summary
                  </button>
                  <button className={`rtab ${activeTab === "table" ? "active" : ""}`} onClick={() => setActiveTab("table")}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.5" y="0.5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" /><path d="M0.5 4.5H12.5M4.5 4.5V12.5" stroke="currentColor" strokeWidth="1.2" /></svg>
                    Table
                  </button>
                  <button className={`rtab ${activeTab === "sql" ? "active" : ""}`} onClick={() => setActiveTab("sql")}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 3L1 6.5L4 10M9 3L12 6.5L9 10M7 1L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    SQL
                  </button>
                </div>
              </div>

              {/* Summary tab */}
              {activeTab === "summary" && (
                <div className="tab-content summary-content">
                  <div className="ai-badge">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.5 5.5H13L9.5 8L10.5 12.5L7 10L3.5 12.5L4.5 8L1 5.5H5.5L7 1Z" fill="rgba(255,77,28,0.8)" /></svg>
                    AI Insight
                  </div>
                  <p className="summary-text">
                    <TypedText text={result.answer} speed={14} />
                  </p>
                </div>
              )}

              {/* Chart tab */}
              {activeTab === "chart" && hasChart && (
                <div className="tab-content chart-content">
                  <SmartChart columns={result.columns} rows={result.rows} />
                </div>
              )}

              {/* Table tab */}
              {activeTab === "table" && (
                <div className="tab-content table-content">
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {result.columns.map((c, i) => <th key={i}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci}>
                                {isNumeric(cell) ? <span className="num-cell">{parseFloat(cell) % 1 !== 0 ? `$${parseFloat(cell).toFixed(2)}` : cell}</span> : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SQL tab */}
              {activeTab === "sql" && (
                <div className="tab-content sql-content">
                  <div className="sql-header">
                    <div className="sql-badge">
                      <span className="sql-dot read-only" />
                      Read-only · Verified
                    </div>
                    <button className="copy-btn" onClick={copySql}>
                      {copied ? (
                        <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7L5 10L11 3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied</>
                      ) : (
                        <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M4 4H2.5C1.67 4 1 4.67 1 5.5V10.5C1 11.33 1.67 12 2.5 12H7.5C8.33 12 9 11.33 9 10.5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg> Copy</>
                      )}
                    </button>
                  </div>
                  <pre className="sql-pre"><code>{result.sql}</code></pre>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
