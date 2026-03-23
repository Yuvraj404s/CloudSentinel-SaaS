import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">CS</div>
        <span className="font-bold text-lg text-white">CloudSentinel</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-300 hover:text-white transition text-sm">Dashboard</Link>
        <Link to="/upload" className="text-gray-300 hover:text-white transition text-sm">Upload</Link>
        <Link to="/settings" className="text-gray-300 hover:text-white transition text-sm">Settings</Link>
        <span className="text-xs text-gray-500">{user?.username}</span>
        <button onClick={handleLogout} className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg transition">Logout</button>
      </div>
    </nav>
  );
}
