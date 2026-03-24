import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      login(data.token, data.username);
      navigate("/");
    } catch (err) {
      // Show exact backend error message
      const msg = err.response?.data?.message || err.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">☁</div>
          <div>
            <h1 className="font-bold text-xl text-white">CloudSentinel</h1>
            <p className="text-xs text-gray-400">Cloud Cost Intelligence Platform</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
          {["login","register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode===m?"bg-blue-600 text-white":"text-gray-400 hover:text-white"}`}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Username</label>
            <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})}
              placeholder="Enter your username" required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" />
          </div>
          {mode === "register" && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                placeholder="Enter your email" type="email" required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
              placeholder={mode === "register" ? "Min. 6 characters" : "Enter your password"}
              type="password" required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Please wait...</>
            ) : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode==="login"?"register":"login"); setError(""); }}
            className="text-blue-400 hover:underline">{mode === "login" ? "Register" : "Sign In"}</button>
        </p>
      </div>
    </div>
  );
}
