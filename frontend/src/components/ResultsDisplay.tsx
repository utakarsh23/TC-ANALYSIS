"use client";

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
import { useEffect, useState } from "react";

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

interface ResultsDisplayProps {
  executions: Execution[];
  complexityAnalysis: ComplexityAnalysis[];
  loading: boolean;
}

export default function ResultsDisplay({
  executions,
  complexityAnalysis,
  loading,
}: ResultsDisplayProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (executions.length === 0) return;

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

    const labels = executions[0].results.map((r) => {
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

    setChartData({
      labels,
      datasets,
    });
  }, [executions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-500 dark:text-zinc-400">
        Run your code to see results
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {chartData && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
            Execution Time Analysis
          </h3>
          <div className="h-96">
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
                      font: { size: 12, weight: "bold" },
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
                    grid: {
                      color: "rgba(120, 113, 108, 0.1)",
                    },
                    ticks: {
                      color: "rgb(120, 113, 108)",
                      font: { size: 11 },
                      callback: function (value: any) {
                        return value.toFixed(2) + "ms";
                      },
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
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
      )}

      {/* Execution Errors */}
      {executions.some((exec) => exec.results.some((r) => r.error)) && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-5">
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
                    className="bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-800 rounded p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                        {exec.tag} - {result.inputSize}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-950/50 p-2 rounded">
                      {result.error}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {complexityAnalysis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complexityAnalysis.map((ca) => (
            <div
              key={ca.tag}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5"
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

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          ℹ️ Graph shows runtime in milliseconds across input sizes (100 to 1M
          elements). Lower is better. Complexity analysis is heuristic-based.
        </p>
      </div>
    </div>
  );
}
