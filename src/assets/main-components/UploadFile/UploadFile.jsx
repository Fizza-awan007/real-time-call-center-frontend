import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { RTNavbar } from "../../common-components/index";
import { postAPIWithAuth } from "../../../utils/api";
import { DID_POOL_IMPORTS } from "../../../utils/apiUrls";

const MAX_SIZE_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const validate = (f) => {
    if (!f) return "";
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      return "Only Excel files (.xlsx, .xls) are allowed.";
    }
    if (f.size > MAX_SIZE_BYTES) {
      return "File size exceeds the 1 GB limit.";
    }
    return "";
  };

  const handleFile = (f) => {
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
    } else {
      setError("");
      setFile(f);
    }
  };

  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    setError("");
  };

  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await postAPIWithAuth(DID_POOL_IMPORTS, formData, {
      "Content-Type": "multipart/form-data",
    });
    setUploading(false);
    if (res.success) {
      toast.success("File uploaded successfully!");
      setFile(null);
    } else {
      const msg = res.data?.error || res.data?.message || "Upload failed. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <RTNavbar />
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <h1 className="font-urbanist text-[24px] font-semibold text-[#1a1d23]">
              Upload Excel File
            </h1>
            <p className="mt-1 text-[14px] text-[#62748E]">
              Only .xlsx and .xls files are accepted. Maximum size: 1 GB.
            </p>
          </div>

          <div
            onClick={() => !file && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (!file) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-white px-8 py-14 transition-colors ${
              file
                ? "border-indigo-300 cursor-default"
                : dragOver
                  ? "border-indigo-500 bg-indigo-50 cursor-pointer"
                  : "border-gray-200 hover:border-indigo-400 cursor-pointer"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleInputChange}
            />

            {!file ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4v16M8 12l8-8 8 8" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 24h20" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[#1a1d23]">
                    Drag & drop your file here
                  </p>
                  <p className="mt-1 text-[13px] text-[#62748E]">
                    or <span className="text-indigo-500 font-medium">browse</span> to choose a file
                  </p>
                </div>
              </>
            ) : (
              <div className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="1" width="16" height="20" rx="2" stroke="#10b981" strokeWidth="1.6" />
                    <path d="M7 8h8M7 12h5" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#1a1d23]">{file.name}</p>
                  <p className="text-[12px] text-[#62748E]">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                  title="Remove file"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-center text-[13px] font-medium text-red-500">{error}</p>
          )}

          {file && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="mt-5 w-full rounded-xl bg-indigo-500 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadFile;
