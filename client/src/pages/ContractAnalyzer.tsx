import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contractsApi } from "../api/contracts";

type InputMode = "text" | "upload";

export default function ContractAnalyzer() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<InputMode>("text");
  const [title, setTitle] = useState("");
  const [contractText, setContractText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      const ext = selected.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "txt") {
        setError("Only .pdf and .txt files are supported");
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(selected.name.replace(/\.[^.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (mode === "upload" && file) {
        response = await contractsApi.upload(file, title, email || undefined);
      } else {
        response = await contractsApi.analyze({
          title,
          contract_text: contractText,
          user_email: email || undefined,
        });
      }
      navigate(`/results/${response.data.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to analyze contract. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    title &&
    (mode === "text" ? contractText.length > 0 : file !== null) &&
    !loading;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyze Contract</h1>
          <p className="mt-2 text-gray-600">
            {mode === "text"
              ? "Paste your contract text below."
              : "Upload a PDF or text file."}{" "}
            The AI will identify potentially disputable clauses and suggest
            improvements.
          </p>
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "text" ? "upload" : "text");
            setError(null);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
          title={
            mode === "text" ? "Switch to file upload" : "Switch to text input"
          }
        >
          {mode === "text" ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload File
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Paste Text
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contract Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Software Development Agreement"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {mode === "text" ? (
          <div>
            <label
              htmlFor="contract"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contract Text
            </label>
            <textarea
              id="contract"
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste the full contract text here..."
              required
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {contractText.length > 0
                ? `${(contractText.length / 1024).toFixed(1)} KB`
                : "Supports plain text contracts"}
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Contract File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dt = new DataTransfer();
                    dt.items.add(dropped);
                    input.files = dt.files;
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                  handleFileChange({
                    target: { files: e.dataTransfer.files },
                  } as any);
                }
              }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    <span className="text-blue-600 font-medium">
                      Click to browse
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF or TXT (max 500KB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email for Report (optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze Contract"
          )}
        </button>
      </form>
    </div>
  );
}
