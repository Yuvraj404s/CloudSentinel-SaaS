import { useState, useRef } from "react";
import api from "../utils/axios";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setResult(null); setError(""); setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/billing/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      setResult(data);
      setProgress(100);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Billing CSV</h1>
        <p className="text-gray-400 text-sm mt-1">Upload your cloud billing export to analyse costs</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-gray-700 hover:border-blue-500 transition rounded-xl p-10 text-center cursor-pointer">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-gray-300 text-sm font-medium">{file ? file.name : "Click to choose a CSV file"}</p>
          <p className="text-gray-500 text-xs mt-1">Max size: 50MB</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden"
            onChange={e => { setFile(e.target.files[0]); setResult(null); setError(""); }} />
        </div>

        {uploading && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Uploading...</span><span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-900/40 border border-green-700 rounded-xl p-4 text-sm text-green-300">
            ✅ <strong>{result.saved}</strong> records saved &nbsp;|&nbsp; <strong>{result.skipped}</strong> duplicates skipped
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-sm text-red-300">❌ {error}</div>
        )}

        <button onClick={handleUpload} disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition text-sm">
          {uploading ? "Uploading..." : "Upload CSV"}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Expected CSV Format</h3>
        <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
          <div>serviceName,usageAmount,cost,billingDate,region,cloudProvider</div>
          <div>EC2,100,45.50,2026-03-01,us-east-1,AWS</div>
          <div>S3,500,12.30,2026-03-01,us-west-2,AWS</div>
          <div>BigQuery,200,8.90,2026-03-01,us-central1,GCP</div>
        </div>
      </div>
    </div>
  );
}
