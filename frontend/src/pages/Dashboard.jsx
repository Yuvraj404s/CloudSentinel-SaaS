import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../utils/axios";

const PROVIDER_COLORS = { AWS: "#FF9900", GCP: "#4285F4", Azure: "#0078D4" };
const PIE_COLORS = ["#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444"];

// Custom Y-axis tick with $ unit
const DollarTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={4} textAnchor="end" fill="#9CA3AF" fontSize={11}>
    ${payload.value}
  </text>
);

// Custom tooltip
const ChartTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#fff" }}>
          {p.name}: <strong>${parseFloat(p.value).toFixed(2)}</strong>{unit}
        </p>
      ))}
    </div>
  );
};

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className={`text-xl font-bold ${color || "text-white"}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="text-5xl mb-3">📂</div>
      <p className="text-gray-400 text-sm font-medium">No data yet</p>
      <p className="text-gray-600 text-xs mt-1">Upload a billing CSV to see your analytics</p>
      <a href="/upload" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm text-white transition">Upload Now →</a>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState("All");

  const fetchAnalytics = useCallback(async (provider = "All") => {
    setFilterLoading(true);
    try {
      const [analyticsRes, alertRes] = await Promise.all([
        api.get(`/analytics?provider=${provider}`),
        api.get("/alerts/status")
      ]);
      setData(analyticsRes.data);
      setAlert(alertRes.data);
    } finally {
      setFilterLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics("All"); }, [fetchAnalytics]);

  const handleProviderFilter = (provider) => {
    setActiveProvider(provider);
    fetchAnalytics(provider);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      <span className="text-gray-400 text-sm">Loading analytics...</span>
    </div>
  );

  const hasData = data?.monthlySpend?.length > 0 || data?.dailyTrend?.length > 0;
  const monthlyChartData = data?.monthlySpend?.map(d => ({ name: d.service, "Cost (USD)": parseFloat(d.total) })) || [];
  const dailyChartData = data?.dailyTrend?.map(d => ({ date: d.date?.slice(5), "Cost (USD)": parseFloat(d.cost) })) || [];
  const providerData = data?.providerBreakdown?.map(d => ({ name: d.provider, value: parseFloat(d.total) })) || [];
  const topRegions = data?.topRegions || [];
  const providers = ["All", ...(data?.providerBreakdown?.map(p => p.provider) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Cloud cost intelligence for {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>
        {filterLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {alert?.exceeded && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm font-medium flex items-center gap-2">
          🚨 Budget Alert: Spent <strong className="mx-1">${parseFloat(alert.currentSpend).toFixed(2)}</strong> — exceeded threshold of <strong className="mx-1">${parseFloat(alert.threshold).toFixed(2)}</strong>!
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💸" label="Current Month Spend" value={`$${parseFloat(data?.currentMonthTotal||0).toFixed(2)}`} sub="All providers combined" color="text-blue-400" />
        <StatCard icon="📈" label="Projected Total" value={`$${parseFloat(data?.projectedMonthlyTotal||0).toFixed(2)}`} sub="End-of-month estimate" color="text-violet-400" />
        <StatCard icon="🎯" label="Budget Threshold" value={`$${parseFloat(alert?.threshold||0).toFixed(2)}`} sub="Monthly limit" />
        <StatCard icon={alert?.exceeded ? "🔴" : "🟢"} label="Budget Status"
          value={alert?.exceeded ? "Exceeded" : "On Track"}
          sub={alert?.exceeded ? "Review spending now" : "You're within budget"}
          color={alert?.exceeded ? "text-red-400" : "text-green-400"} />
      </div>

      {!hasData ? <EmptyState /> : (
        <>
          {/* Provider Filter — now functional! */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Filter charts by provider:</span>
            {providers.map(p => (
              <button key={p} onClick={() => handleProviderFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  activeProvider === p
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"}`}>
                {p === "AWS" ? "🟠 AWS" : p === "GCP" ? "🔵 GCP" : p === "Azure" ? "🔷 Azure" : "🌐 All"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart — Cost by Service */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-300">Cost by Service</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">USD ($)</span>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                {activeProvider === "All" ? "All cloud providers" : `Filtered: ${activeProvider} only`}
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChartData} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <YAxis tick={<DollarTick />} label={{ value: "USD ($)", angle: -90, position: "insideLeft", fill: "#6B7280", fontSize: 10, dx: -10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Cost (USD)" radius={[4,4,0,0]} name="Cost">
                    {monthlyChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart — Daily Trend */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-300">Daily Spend Trend</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Last 30 Days</span>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                {activeProvider === "All" ? "All cloud providers" : `Filtered: ${activeProvider} only`}
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dailyChartData} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} label={{ value: "Date (MM-DD)", position: "insideBottom", fill: "#6B7280", fontSize: 10, dy: 10 }} height={40} />
                  <YAxis tick={<DollarTick />} label={{ value: "USD ($)", angle: -90, position: "insideLeft", fill: "#6B7280", fontSize: 10, dx: -10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="Cost (USD)" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: "#8B5CF6" }} name="Daily Cost" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart — Provider Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-300">Spend by Cloud Provider</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">This Month</span>
              </div>
              <p className="text-xs text-gray-600 mb-4">Total cost distribution across providers</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={providerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                    label={({ name, percent, value }) => `${name}: $${parseFloat(value).toFixed(0)} (${(percent*100).toFixed(0)}%)`}
                    labelLine={true}>
                    {providerData.map((entry, i) => (
                      <Cell key={i} fill={PROVIDER_COLORS[entry.name] || PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`$${parseFloat(v).toFixed(2)}`, "Cost (USD)"]} contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} />
                  <Legend formatter={(v) => <span style={{ color: "#D1D5DB", fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Regions */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-300">Top Spending Regions</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Top 5</span>
              </div>
              <p className="text-xs text-gray-600 mb-4">Highest cost regions this month (USD)</p>
              <div className="space-y-4 mt-2">
                {topRegions.map((r, i) => {
                  const maxCost = parseFloat(topRegions[0].total);
                  const cost = parseFloat(r.total);
                  const pct = (cost / maxCost) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-300 font-medium">{r.region}</span>
                        <span className="text-blue-400 font-semibold">${cost.toFixed(2)} USD</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{pct.toFixed(0)}% of top region spend</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
