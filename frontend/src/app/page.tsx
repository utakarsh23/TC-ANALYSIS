"use client";

import { useState } from "react";
import axios from "axios";
import CodeEditor from "@/components/CodeEditor";
import LanguageSelector from "@/components/LanguageSelector";
import TagSelector from "@/components/TagSelector";
import ImportsInput from "@/components/ImportsInput";
import ResultsDisplay from "@/components/ResultsDisplay";
import Toast from "@/components/Toast";
import GraphModal from "@/components/GraphModal";
import InputTypeSelector, { type InputType } from "@/components/InputTypeSelector";
import CustomTestCases, { type CustomTestCase } from "@/components/CustomTestCases";
// env variable for backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
// const BACKEND_URL = "http://localhost:9092";


interface Execution {
  tag: string;
  results: Array<{
    inputSize: number | string;
    timeMs: number;
    timeNs: number;
    error?: string;
  }>;
}

interface ComplexityAnalysis {
  tag: string;
  analysis: {
    complexity: string;
    confidence: number;
  };
}

interface ExecutionHistory {
  id: string;
  timestamp: string;
  language: string;
  code: string;
  imports: string[];
  tags: string[];
  executions: Execution[];
  complexityAnalysis: ComplexityAnalysis[];
}

const DEFAULT_CODE: Record<string, Record<string, string>> = {
  java: {
    "int[]": "static void solve(int[] arr) {\n  // Your code here\n  // Arrays.sort(arr);\n}",
    "int": "static void solve(int n) {\n  // Your code here\n}",
    "long": "static void solve(long n) {\n  // Your code here\n}",
    "long[]": "static void solve(long[] arr) {\n  // Your code here\n}",
    "string": "static void solve(String s) {\n  // Your code here\n}",
    "string[]": "static void solve(String[] arr) {\n  // Your code here\n}",
    "char[]": "static void solve(char[] arr) {\n  // Your code here\n}",
  },
  cpp: {
    "int[]": "void solve(vector<int>& arr) {\n  // Your code here\n  // sort(arr.begin(), arr.end());\n}",
    "int": "void solve(int n) {\n  // Your code here\n}",
    "long": "void solve(long long n) {\n  // Your code here\n}",
    "long[]": "void solve(vector<long long>& arr) {\n  // Your code here\n}",
    "string": "void solve(string& s) {\n  // Your code here\n}",
    "string[]": "void solve(vector<string>& arr) {\n  // Your code here\n}",
    "char[]": "void solve(vector<char>& arr) {\n  // Your code here\n}",
  },
  python: {
    "int[]": "def solve(arr):\n  # Your code here\n  # arr.sort()\n  pass",
    "int": "def solve(n):\n  # Your code here\n  pass",
    "long": "def solve(n):\n  # Your code here\n  pass",
    "long[]": "def solve(arr):\n  # Your code here\n  pass",
    "string": "def solve(s):\n  # Your code here\n  pass",
    "string[]": "def solve(arr):\n  # Your code here\n  pass",
    "char[]": "def solve(arr):\n  # Your code here\n  pass",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<"java" | "cpp" | "python">("java");
  const [code, setCode] = useState(DEFAULT_CODE.java["int[]"]);
  const [tags, setTags] = useState<string[]>(["custom"]);
  const [imports, setImports] = useState<string[]>([]);
  const [inputType, setInputType] = useState<InputType>("int[]");
  const [customTestCases, setCustomTestCases] = useState<CustomTestCase[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<
    ComplexityAnalysis[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // History and UI state
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLanguageChange = (lang: "java" | "cpp" | "python") => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang][inputType]);
    setError(null);
  };

  const handleInputTypeChange = (type: InputType) => {
    setInputType(type);
    setCode(DEFAULT_CODE[language][type]);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Code cannot be empty");
      return;
    }

    const filteredCustom = customTestCases
      .filter((tc) => tc.enabled && tc.input.trim())
      .map((tc) => tc.input.trim());

    const isCustomMode = tags.includes('custom');

    // Validate based on mode
    if (isCustomMode && filteredCustom.length === 0) {
      // Debug: show how many test cases exist and how many are enabled
      const enabledCount = customTestCases.filter(tc => tc.enabled).length;
      const withInputCount = customTestCases.filter(tc => tc.input.trim()).length;
      
      if (customTestCases.length === 0) {
        setError("Add at least one custom test case");
      } else if (enabledCount === 0) {
        setError("Enable at least one custom test case (click the checkmark)");
      } else if (withInputCount === 0) {
        setError("Fill in the custom test case inputs");
      } else {
        setError("Add at least one custom test case");
      }
      return;
    }

    if (!isCustomMode && tags.length === 0) {
      setError("Select at least one test case type");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Submit job - returns immediately with jobId
      const submitResponse = await axios.post(
        `${BACKEND_URL}/api/submit`,
        {
          code,
          lang: language,
          tags: tags,
          imports: imports.filter((i) => i.trim()),
          inputType,
          customTestCases: filteredCustom,
        }
      );

      console.log("Job submitted:", submitResponse.data);
      const jobId = submitResponse.data.jobId;

      // Job is queued, turn off loading on button
      setLoading(false);

      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(
            `${BACKEND_URL}/api/status/${jobId}`
          );

          console.log("Job status:", statusResponse.data);

          if (statusResponse.data.status === "completed") {
            clearInterval(pollInterval);
            
            const result = statusResponse.data.result;
            const executionData = result.executions || [];
            const complexityData = result.complexityAnalysis || [];

            setExecutions(executionData);
            setComplexityAnalysis(complexityData);

            // Save to history
            const historyEntry: ExecutionHistory = {
              id: result.jobId || Date.now().toString(),
              timestamp: new Date().toLocaleString(),
              language,
              code,
              imports: imports.filter((i) => i.trim()),
              tags,
              executions: executionData,
              complexityAnalysis: complexityData,
            };

            setExecutionHistory((prev) => [historyEntry, ...prev]);
            setSelectedHistoryId(historyEntry.id);
            
            // Show toast notification
            setShowToast(true);
            setLoading(false);
          } else if (statusResponse.data.status === "failed") {
            clearInterval(pollInterval);
            setError(statusResponse.data.error?.message || "Execution failed");
            setLoading(false);
          }
          // If still processing or queued, keep polling
        } catch (pollError: any) {
          console.error("Polling error:", pollError);
          clearInterval(pollInterval);
          setError("Failed to check job status");
          setLoading(false);
        }
      }, 2000); // Poll every 2 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          setError("Job timed out - took too long to process");
          setLoading(false);
        }
      }, 300000); // 5 minutes

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to execute code. Make sure backend is running"
      );
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenModal = (historyId?: string) => {
    const id = historyId || selectedHistoryId;
    if (id) {
      setSelectedHistoryId(id);
      setIsModalOpen(true);
      setShowToast(false);
    }
  };

  const selectedHistory = executionHistory.find(
    (h) => h.id === selectedHistoryId
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              DSA Runtime Analysis
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Test your algorithm across different input types and visualize performance
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Editor & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selector */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
                Language
              </label>
              <LanguageSelector
                selected={language}
                onChange={handleLanguageChange}
              />
            </div>

            {/* Test Cases */}
            <TagSelector selected={tags} onChange={setTags} />

            {/* Input Type */}
            <InputTypeSelector selected={inputType} onChange={handleInputTypeChange} />

            {/* Custom Test Cases */}
            <CustomTestCases
              testCases={customTestCases}
              onChange={setCustomTestCases}
            />

            {/* Imports */}
            <ImportsInput imports={imports} onChange={setImports} />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-200">
                  <span className="font-semibold">Error:</span> {error}
                </p>
              </div>
            )}

            {/* Execution History */}
            {executionHistory.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
                  Execution History ({executionHistory.length})
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {executionHistory.map((history) => (
                    <button
                      key={history.id}
                      onClick={() => handleOpenModal(history.id)}
                      className="w-full text-left p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {history.language.toUpperCase()} • {history.tags.join(", ")}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {history.timestamp}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-zinc-400 flex-shrink-0 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Code Editor */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
              Code Editor
            </label>
            <div className="h-[70vh] min-h-[400px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(executions.length > 0 || loading) && (
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <ResultsDisplay
              executions={executions}
              complexityAnalysis={complexityAnalysis}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Open Graph"
          icon="📊"
          onClose={() => setShowToast(false)}
          onClick={() => handleOpenModal()}
        />
      )}

      {/* Graph Modal */}
      {selectedHistory && (
        <GraphModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          executions={selectedHistory.executions}
          complexityAnalysis={selectedHistory.complexityAnalysis}
          code={selectedHistory.code}
          language={selectedHistory.language}
          timestamp={selectedHistory.timestamp}
        />
      )}

      {/* Floating Run Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold shadow-xl hover:shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M4 3.5a.75.75 0 011.155-.63l9 6a.75.75 0 010 1.26l-9 6A.75.75 0 014 15.5v-12z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <span>{loading ? "Running..." : "Run"}</span>
      </button>
    </div>
  );
}
