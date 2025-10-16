import React, { useEffect, useState, useMemo } from "react";

// MentalHealthDashboard.jsx
// Single-file React component (Tailwind CSS assumed) implementing
// a frontend dashboard for "Detecting Emerging Mental Health Trends"
// Uses: recharts for charts, react-force-graph for network visualization
// NPM packages assumed available: react, react-dom, recharts, react-force-graph, axios

import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ForceGraph2D from "react-force-graph-2d";

export default function MentalHealthDashboard() {
  // UI state
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)
  ); // 30 days ago
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [platform, setPlatform] = useState("twitter");

  // Data state
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [emotionCounts, setEmotionCounts] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // Colors for emotion pie
  const EMOTION_COLORS = {
    sadness: "#6366F1",
    anger: "#EF4444",
    fear: "#F59E0B",
    joy: "#10B981",
    neutral: "#9CA3AF",
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, platform]);

  async function fetchData() {
    setLoading(true);
    try {
      // NOTE: Replace these endpoints with your backend endpoints
      // For this demo we'll use mocked data generation function instead
      const data = await mockFetchDashboardData(fromDate, toDate, platform);

      setTimeSeriesData(data.timeSeries);
      setTopicData(data.topics);
      setEmotionCounts(data.emotions);
      setGraphData(data.graph);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  // Quick memoized derived stats
  const totalMentions = useMemo(() => {
    return timeSeriesData.reduce((s, d) => s + (d.count || 0), 0);
  }, [timeSeriesData]);

  const latestAnxietyScore = useMemo(() => {
    if (!timeSeriesData.length) return 0;
    return timeSeriesData[timeSeriesData.length - 1].anxiety || 0;
  }, [timeSeriesData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold">Mental Health Trends Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Detecting emerging mental health signals from social media</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="col-span-1 lg:col-span-4 flex items-center gap-4">
          <label className="text-sm text-gray-700">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 border rounded"
          />

          <label className="text-sm text-gray-700">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 border rounded"
          />

          <label className="text-sm text-gray-700">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="p-2 border rounded">
            <option value="twitter">Twitter</option>
            <option value="reddit">Reddit</option>
            <option value="instagram">Instagram</option>
          </select>

          <button
            onClick={fetchData}
            className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: time series */}
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Emotion Time Series</h2>
          <p className="text-sm text-gray-500 mb-3">Daily aggregated emotional intensity and mention counts</p>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Mentions" stroke="#4B5563" dot={false} />
                <Line type="monotone" dataKey="anxiety" name="Anxiety" stroke="#EF4444" dot={false} />
                <Line type="monotone" dataKey="sadness" name="Sadness" stroke="#6366F1" dot={false} />
                <Line type="monotone" dataKey="joy" name="Joy" stroke="#10B981" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: metrics and pie */}
        <div className="col-span-1 bg-white p-4 rounded shadow space-y-4">
          <div>
            <h3 className="text-sm text-gray-500">Total Mentions</h3>
            <div className="text-2xl font-bold">{totalMentions}</div>
            <div className="text-xs text-gray-400">From {fromDate} to {toDate} — {platform}</div>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Latest anxiety score</h3>
            <div className="text-2xl font-bold text-red-600">{(latestAnxietyScore * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Higher means more anxiety-related mentions</div>
          </div>

          <div>
            <h3 className="text-sm text-gray-500 mb-2">Emotion Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={emotionCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {emotionCounts.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={EMOTION_COLORS[entry.name] || "#d1d5db"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Topics and Network */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-1 lg:col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Top Emerging Topics</h2>
          <ul className="space-y-2">
            {topicData.map((t, i) => (
              <li key={i} className="p-2 border rounded hover:bg-gray-50">
                <div className="font-medium">{t.topic}</div>
                <div className="text-xs text-gray-500">Change: {t.changePct > 0 ? "+" : ""}{(t.changePct * 100).toFixed(1)}% — Mentions: {t.mentions}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Interaction Network (sample)</h2>
          <p className="text-sm text-gray-500 mb-2">Nodes sized by degree, colored by average sentiment</p>
          <div style={{ width: "100%", height: 420 }}>
            <ForceGraph2D
              graphData={graphData}
              nodeLabel={(n) => `${n.id}\nSentiment: ${n.sentiment ? n.sentiment.toFixed(2) : "N/A"}`}
              nodeRelSize={4}
              nodeVal={(n) => n.degree || 1}
              linkDirectionalParticles={1}
              linkDirectionalParticleWidth={1}
              cooldownTicks={100}
              // color nodes by sentiment
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.id;
                const sentiment = node.sentiment || 0;
                const r = 4 + (node.degree || 1) * 1.2;
                // sentiment -> color
                const color = sentiment > 0.1 ? "#10B981" : sentiment < -0.1 ? "#EF4444" : "#9CA3AF";
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.fillStyle = "#111827";
                ctx.font = `${12 / globalScale}px Sans-Serif`;
                ctx.fillText(label, node.x + r + 2, node.y + 4 / globalScale);
              }}
            />
          </div>
        </div>
      </section>

      <footer className="mt-8 text-xs text-gray-500">
        Note: This is a frontend prototype. Replace mocked endpoints with real backend services that provide
        time-series emotion aggregates, topics, and graph data.
      </footer>
    </div>
  );
}


// ----------------------
// Mock data generator for demo purposes
// ----------------------
async function mockFetchDashboardData(fromDate, toDate, platform) {
  // Simulate latency
  await new Promise((res) => setTimeout(res, 350));

  // Generate daily dates between fromDate and toDate
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  const timeSeries = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const iso = d.toISOString().slice(0, 10);
    // create a base mention count with some random walk
    const base = Math.round(200 + 40 * Math.sin(i / 6) + Math.random() * 60);
    const anxiety = Math.max(0, (Math.sin(i / 7 + 0.5) + Math.random() * 0.6) / 2);
    const sadness = Math.max(0, (Math.cos(i / 8) + Math.random() * 0.6) / 2);
    const joy = Math.max(0, (Math.cos(i / 5 + 1) + Math.random() * 0.6) / 2);
    timeSeries.push({ date: iso, count: base, anxiety, sadness, joy });
  }

  // Topics — simulate some topics with change percentages
  const topics = [
    { topic: "exam stress", changePct: 0.22, mentions: 420 },
    { topic: "job market anxiety", changePct: 0.12, mentions: 320 },
    { topic: "sleep issues", changePct: 0.08, mentions: 210 },
    { topic: "financial pressure", changePct: 0.05, mentions: 150 },
  ];

  // Emotions
  const emotions = [
    { name: "sadness", value: 0.38 },
    { name: "anger", value: 0.12 },
    { name: "fear", value: 0.18 },
    { name: "joy", value: 0.10 },
    { name: "neutral", value: 0.22 },
  ];

  // Graph
  const nodes = [];
  const links = [];
  // generate clusters
  for (let i = 0; i < 40; i++) {
    nodes.push({ id: `user_${i}`, degree: Math.round(Math.random() * 10), sentiment: (Math.random() - 0.5) * 1.6 });
  }
  for (let i = 0; i < 80; i++) {
    const a = Math.floor(Math.random() * nodes.length);
    const b = Math.floor(Math.random() * nodes.length);
    if (a !== b) links.push({ source: nodes[a].id, target: nodes[b].id, value: Math.random() });
  }

  return { timeSeries, topics, emotions, graph: { nodes, links } };
}
