import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../utils/axios";

const PROVIDER_COLORS = { AWS: "#FF9900", GCP: "#4285F4", Azure: "#0078D4", default: "#8B5CF6" };
const PIE_COLORS = ["#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444"];

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
  const [activeProvider, setActiveProvider] = useState("All");

  useEffect(() => {
    Promise.all([api.get("/analytics"), api.get("/alerts/status")])
      .then(([a, al]) => { setData(a.data); setAlert(al.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      <span className="text-gray-400 text-sm">Loading analytics...</span>
    </div>
  );

  const hasData = data?.monthlySpend?.length > 0;
  const monthlyChartData = data?.monthlySpend?.map(d => ({ name: d.service, cost: parseFloat(d.total) })) || [];
  const dailyChartData = data?.dailyTrend?.map(d => ({ date: d.date?.slice(5), cost: parseFloat(d.cost) })) || [];
  const providerData = data?.providerBreakdown?.map(d => ({ name: d.provider, value: parseFloat(d.total) })) || [];
  const topRegions = data?.topRegions || [];
  const providers = ["All", ...(data?.providerBreakdown?.map(p => p.provider) || [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time cloud cost intelligence</p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
      </div>

      {alert?.exceeded && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm font-medium flex items-center gap-2">
          🚨 <span>Budget Alert: Spent <strong>${parseFloat(alert.currentSpend).toFixed(2)}</strong> — exceeded threshold of <strong>${parseFloat(alert.threshold).toFixed(2)}</strong>!</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💸" label="Current Month Spend" value={`$${parseFloat(data?.currentMonthTotal||0).toFixed(2)}`} sub="This month so far" color="text-blue-400" />
        <StatCard icon="📈" label="Projected Total" value={`$${parseFloat(data?.projectedMonthlyTotal||0).toFixed(2)}`} sub="End-of-month estimate" color="text-violet-400" />
        <StatCard icon="🎯" label="Budget Threshold" value={`$${parseFloat(alert?.threshold||0).toFixed(2)}`} sub="Monthly limit" />
        <StatCard icon={alert?.exceeded ? "🔴" : "🟢"} label="Budget Status"
          value={alert?.exceeded ? "Exceeded" : "On Track"}
          sub={alert?.exceeded ? "Review spending now" : "You're within budget"}
          color={alert?.exceeded ? "text-red-400" : "text-green-400"} />
      </div>

      {!hasData ? <EmptyState /> : (
        <>
          {/* Provider Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Filter by provider:</span>
            {providers.map(p => (
              <button key={p} onClick={() => setActiveProvider(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                  activeProvider === p
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}>
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Cost by Service</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`$${v.toFixed(2)}`, "Cost"]} />
                  <Bar dataKey="cost" radius={[4,4,0,0]}>
                    {monthlyChartData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Daily Spend Trend (30 Days)</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`$${parseFloat(v).toFixed(2)}`, "Cost"]} />
                  <Line type="monotone" dataKey="cost" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: "#8B5CF6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Provider Pie */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Spend by Cloud Provider</h2>
              {providerData.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={providerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {providerData.map((entry, i) => (
                        <Cell key={i} fill={PROVIDER_COLORS[entry.name] || PROVIDER_COLORS.default} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`$${parseFloat(v).toFixed(2)}`, "Cost"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Regions */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Top Spending Regions</h2>
              {topRegions.length === 0 ? <EmptyState /> : (
                <div className="space-y-3 mt-2">
                  {topRegions.map((r, i) => {
                    const maxCost = parseFloat(topRegions[0].total);
                    const pct = (parseFloat(r.total) / maxCost) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{r.region}</span>
                          <span className="text-blue-400 font-medium">${parseFloat(r.total).toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
