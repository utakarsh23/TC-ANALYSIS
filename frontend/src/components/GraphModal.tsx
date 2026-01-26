"use client";

import { useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  executions: Execution[];
  complexityAnalysis: ComplexityAnalysis[];
  code: string;
  language: string;
  timestamp: string;
}

export default function GraphModal({
  isOpen,
  onClose,
  executions,
  complexityAnalysis,
  code,
  language,
  timestamp,
}: GraphModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = [
    { border: "rgb(239, 68, 68)", bg: "rgba(239, 68, 68, 0.1)" },
    { border: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.1)" },
    { border: "rgb(16, 185, 129)", bg: "rgba(16, 185, 129, 0.1)" },
    { border: "rgb(251, 146, 60)", bg: "rgba(251, 146, 60, 0.1)" },
    { border: "rgb(168, 85, 247)", bg: "rgba(168, 85, 247, 0.1)" },
  ];

  const datasets = executions.map((exec, idx) => {
    const color = colors[idx % colors.length];
    return {
      label: exec.tag,
      data: exec.results.map((r) => r.timeMs),
      borderColor: color.border,
      backgroundColor: color.bg,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
    };
  });

  const labels = executions[0]?.results.map((r) => {
    // Handle custom test case labels (strings)
    if (typeof r.inputSize === 'string') {
      return r.inputSize;
    }
    // Format numeric input sizes
    return r.inputSize >= 1000000
      ? `${r.inputSize / 1000000}M`
      : r.inputSize >= 1000
        ? `${r.inputSize / 1000}K`
        : r.inputSize.toString();
  });

  const chartData = {
    labels,
    datasets,
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              📊 Runtime Analysis Results
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {language.toUpperCase()} • {timestamp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg
              className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Graph */}
          <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Execution Time Analysis
            </h3>
            <div className="h-80">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "rgb(120, 113, 108)",
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12, weight: "600" },
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      padding: 12,
                      titleFont: { size: 12, weight: "bold" },
                      bodyFont: { size: 11 },
                      callbacks: {
                        label: function (context: any) {
                          return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}ms`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(120, 113, 108, 0.1)" },
                      ticks: {
                        color: "rgb(120, 113, 108)",
                        font: { size: 11 },
                        callback: function (value: any) {
                          return value.toFixed(2) + "ms";
                        },
                      },
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: "rgb(120, 113, 108)",
                        font: { size: 11 },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Complexity Analysis */}
          {complexityAnalysis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complexityAnalysis.map((ca) => (
                <div
                  key={ca.tag}
                  className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-xl p-5 border border-zinc-200 dark:border-zinc-700"
                >
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 capitalize mb-2">
                    {ca.tag}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Complexity:{" "}
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">
                        {ca.analysis.complexity}
                      </span>
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Confidence:{" "}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {ca.analysis.confidence}%
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Execution Errors */}
          {executions.some((exec) => exec.results.some((r) => r.error)) && (
            <div className="bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200 dark:border-red-900 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Execution Errors
              </h3>
              <div className="space-y-3">
                {executions.flatMap((exec, execIdx) =>
                  exec.results
                    .filter((r) => r.error)
                    .map((result, idx) => (
                      <div
                        key={`${exec.tag}-${execIdx}-${idx}`}
                        className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-red-300 dark:border-red-800 rounded p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 dark:text-red-400 font-semibold text-sm capitalize">
                            {exec.tag} - {result.inputSize}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-red-700 dark:text-red-300 font-mono bg-red-100/70 dark:bg-red-950/50 p-2 rounded">
                          {result.error}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Code Display */}
          <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Source Code
            </h3>
            <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
