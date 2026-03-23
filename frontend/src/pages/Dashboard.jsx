import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../utils/axios";

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/analytics"), api.get("/alerts/status")])
      .then(([analyticsRes, alertRes]) => {
        setData(analyticsRes.data);
        setAlert(alertRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const monthlyChartData = data?.monthlySpend?.map(d => ({ name: d.service, cost: parseFloat(d.total) })) || [];
  const dailyChartData = data?.dailyTrend?.map(d => ({ date: d.date?.slice(5), cost: parseFloat(d.cost) })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time cloud cost intelligence</p>
      </div>

      {alert?.exceeded && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm font-medium">
          ⚠️ Alert: Monthly spend of <strong>${parseFloat(alert.currentSpend).toFixed(2)}</strong> has exceeded your threshold of <strong>${parseFloat(alert.threshold).toFixed(2)}</strong>!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Month Spend" value={`$${parseFloat(data?.currentMonthTotal||0).toFixed(2)}`} sub="This month so far" color="text-blue-400" />
        <StatCard label="Projected Month Total" value={`$${parseFloat(data?.projectedMonthlyTotal||0).toFixed(2)}`} sub="Based on daily avg" color="text-violet-400" />
        <StatCard label="Budget Threshold" value={`$${parseFloat(alert?.threshold||0).toFixed(2)}`} sub="Monthly limit" />
        <StatCard label="Budget Status" value={alert?.exceeded ? "Exceeded" : "On Track"}
          sub={alert?.exceeded ? "Take action now" : "Within budget"} color={alert?.exceeded ? "text-red-400" : "text-green-400"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Cost by Service (This Month)</h2>
          {monthlyChartData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">No data yet. Upload a CSV to get started.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="cost" fill="#3B82F6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Daily Spend Trend (Last 30 Days)</h2>
          {dailyChartData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">No data yet. Upload a CSV to get started.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
