import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

function HistoryRow({ item }) {
  const date = new Date(item.uploadedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-sm text-white font-medium">{item.fileName}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <div className="text-right">
        <span className="text-xs text-green-400 font-medium">{item.recordsSaved} saved</span>
        {item.recordsSkipped > 0 && <span className="text-xs text-yellow-500 ml-2">{item.recordsSkipped} skipped</span>}
      </div>
    </div>
  );
}

export default function Upload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("idle"); // idle | uploading | processing | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/billing/history").then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setStage("uploading"); setResult(null); setError(""); setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/billing/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
          if (pct === 100) setStage("processing");
        }
      });
      setResult(data);
      setStage("success");
      // Redirect to dashboard after 2.5 seconds
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please check your file format.");
      setStage("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Billing Data</h1>
        <p className="text-gray-400 text-sm mt-1">Upload your cloud billing CSV to analyse costs</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">

        {/* Drop zone */}
        {stage === "idle" || stage === "error" ? (
          <div onClick={() => inputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
              ${file ? "border-blue-500 bg-blue-950/20" : "border-gray-700 hover:border-blue-500"}`}>
            <div className="text-4xl mb-3">{file ? "📄" : "📂"}</div>
            <p className="text-gray-300 text-sm font-medium">{file ? file.name : "Click to choose a CSV file"}</p>
            <p className="text-gray-500 text-xs mt-1">{file ? `${(file.size/1024).toFixed(1)} KB` : "Max size: 50MB"}</p>
            <input ref={inputRef} type="file" accept=".csv" className="hidden"
              onChange={e => { setFile(e.target.files[0]); setStage("idle"); setError(""); }} />
          </div>
        ) : null}

        {/* Upload progress */}
        {stage === "uploading" && (
          <div className="py-4 space-y-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Uploading {file?.name}...</span><span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Processing animation */}
        {stage === "processing" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-400 font-medium text-sm">Analysing your billing data...</p>
            <p className="text-gray-500 text-xs">Detecting duplicates, saving records</p>
          </div>
        )}

        {/* Success state */}
        {stage === "success" && result && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-900/50 border-2 border-green-500 flex items-center justify-center text-2xl">✅</div>
            <p className="text-green-400 font-semibold">Upload Successful!</p>
            <p className="text-gray-300 text-sm">
              <strong className="text-white">{result.saved}</strong> records saved &nbsp;|&nbsp;
              <strong className="text-yellow-400">{result.skipped}</strong> duplicates skipped
            </p>
            <p className="text-gray-500 text-xs animate-pulse">Redirecting to Dashboard...</p>
          </div>
        )}

        {/* Error */}
        {stage === "error" && error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-sm text-red-300 flex gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Upload button */}
        {(stage === "idle" || stage === "error") && (
          <button onClick={handleUpload} disabled={!file}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition text-sm">
            Upload & Analyse →
          </button>
        )}
      </div>

      {/* CSV Format */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">📋 Expected CSV Format</h3>
        <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto space-y-0.5">
          <div className="text-gray-500">serviceName,usageAmount,cost,billingDate,region,cloudProvider</div>
          <div>EC2,100,45.50,2026-03-01,us-east-1,AWS</div>
          <div>S3,500,12.30,2026-03-01,us-west-2,AWS</div>
          <div>BigQuery,200,8.90,2026-03-05,us-central1,GCP</div>
          <div>AzureVM,90,41.20,2026-03-05,eastus,Azure</div>
        </div>
      </div>

      {/* Upload History */}
      {history.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">🕒 Recent Uploads</h3>
          {history.map((h, i) => <HistoryRow key={i} item={h} />)}
        </div>
      )}
    </div>
  );
}
