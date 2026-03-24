import { useState, useEffect } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

function CloudConnectCard({ provider, icon, color, connected, onConnect }) {
  return (
    <div className={`border rounded-xl p-4 flex items-center justify-between ${connected ? "border-green-700 bg-green-900/20" : "border-gray-700 bg-gray-800/50"}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-white">{provider}</p>
          <p className="text-xs text-gray-500">{connected ? "Connected — auto-sync enabled" : "Not connected"}</p>
        </div>
      </div>
      <button onClick={() => onConnect(provider)}
        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
          connected ? "bg-green-800 text-green-300 hover:bg-green-700" : "bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white"}`}>
        {connected ? "✓ Connected" : "Connect"}
      </button>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState("");
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [connected, setConnected] = useState({ AWS: false, GCP: false, Azure: false });
  const [showConnectModal, setShowConnectModal] = useState(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    api.get("/alerts/status").then(({ data }) => {
      setCurrent(data.threshold);
      setThreshold(data.threshold);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ text: "", type: "" });
    try {
      await api.put("/alerts/threshold", { threshold: parseFloat(threshold) });
      setCurrent(threshold);
      setMsg({ text: "Threshold updated successfully!", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to update threshold.", type: "error" });
    } finally { setSaving(false); }
  };

  const handleConnect = (provider) => {
    setShowConnectModal(provider);
    setApiKey("");
  };

  const handleSaveConnection = () => {
    if (!apiKey.trim()) return;
    setConnected(prev => ({ ...prev, [showConnectModal]: true }));
    setShowConnectModal(null);
    // In a real app this would call the backend to store credentials securely
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-300">Account</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center font-bold text-lg uppercase">
            {user?.username?.[0]}
          </div>
          <div>
            <p className="text-white font-medium">{user?.username}</p>
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">USER</span>
          </div>
        </div>
      </div>

      {/* Budget Alert */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-300">Monthly Budget Alert</h2>
          <p className="text-gray-500 text-xs mt-1">Get alerted when your monthly cloud spend exceeds this amount.</p>
        </div>
        {current && (
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-900/20 border border-blue-800 rounded-lg px-3 py-2">
            🎯 Current threshold: <strong>${parseFloat(current).toFixed(2)}</strong>
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)}
              placeholder="1000.00" min="0" step="0.01" required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" />
          </div>
          {msg.text && (
            <p className={`text-xs flex gap-1 ${msg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
            </p>
          )}
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition text-sm">
            {saving ? "Saving..." : "Save Threshold"}
          </button>
        </form>
      </div>

      {/* Cloud Connections */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-300">Connect Cloud Accounts</h2>
          <p className="text-gray-500 text-xs mt-1">Connect your cloud accounts for automatic billing sync on login.</p>
        </div>
        <div className="space-y-3">
          <CloudConnectCard provider="AWS" icon="🟠" color="orange" connected={connected.AWS} onConnect={handleConnect} />
          <CloudConnectCard provider="GCP" icon="🔵" color="blue" connected={connected.GCP} onConnect={handleConnect} />
          <CloudConnectCard provider="Azure" icon="🔷" color="blue" connected={connected.Azure} onConnect={handleConnect} />
        </div>
        <p className="text-xs text-gray-600">💡 Connected accounts will auto-fetch billing data daily. You can still upload CSV manually.</p>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-white">Connect {showConnectModal}</h3>
            <p className="text-xs text-gray-400">Enter your {showConnectModal} API key to enable automatic billing sync.</p>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder={`${showConnectModal} API Key / Access Key`}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" />
            <div className="flex gap-2">
              <button onClick={() => setShowConnectModal(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm transition">Cancel</button>
              <button onClick={handleSaveConnection} disabled={!apiKey.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm transition">Connect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
