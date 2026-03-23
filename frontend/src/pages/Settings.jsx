import { useState, useEffect } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState("");
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/alerts/status").then(({ data }) => {
      setCurrent(data.threshold);
      setThreshold(data.threshold);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await api.put("/alerts/threshold", { threshold: parseFloat(threshold) });
      setCurrent(threshold);
      setMsg("✅ Threshold updated successfully!");
    } catch {
      setMsg("❌ Failed to update threshold.");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and alert preferences</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">Account Info</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm uppercase">
            {user?.username?.[0]}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.username}</p>
            <p className="text-gray-500 text-xs">Logged in</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">Monthly Budget Alert</h2>
        <p className="text-gray-500 text-xs">You'll receive an alert when your monthly cloud spend exceeds this amount.</p>
        {current && (
          <p className="text-xs text-blue-400">Current threshold: <strong>${parseFloat(current).toFixed(2)}</strong></p>
        )}
        <form onSubmit={handleSave} className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number" value={threshold} onChange={e => setThreshold(e.target.value)}
              placeholder="1000.00" min="0" step="0.01" required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" />
          </div>
          {msg && <p className={`text-xs ${msg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{msg}</p>}
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition text-sm">
            {saving ? "Saving..." : "Save Threshold"}
          </button>
        </form>
      </div>
    </div>
  );
}
