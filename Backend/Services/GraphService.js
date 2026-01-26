/**
 * GraphService - Generates graph data from execution results
 * Returns data structure ready for frontend charting libraries (Chart.js, Recharts, etc.)
 */

function generateGraphData(executions, lang) {
    // Extract all unique input sizes across all tags
    const inputSizes = [...new Set(
        executions.flatMap(exec => 
            exec.results.map(r => r.inputSize)
        )
    )].sort((a, b) => {
        // Handle numeric sorting for numbers, preserve order for strings (Custom test cases)
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        // Keep custom test cases in their original order
        return 0;
    });

    // Prepare datasets for each tag (Sorted, Unsorted, Random, etc.)
    const datasets = executions.map((execution, index) => {
        const colors = [
            { border: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.5)' },   // Red
            { border: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.5)' },   // Blue
            { border: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.5)' },   // Green
            { border: 'rgb(255, 206, 86)', bg: 'rgba(255, 206, 86, 0.5)' },   // Yellow
            { border: 'rgb(153, 102, 255)', bg: 'rgba(153, 102, 255, 0.5)' }, // Purple
        ];

        const color = colors[index % colors.length];

        return {
            label: execution.tag,
            data: execution.results.map(r => ({
                x: r.inputSize,
                y: r.timeMs || 0,
                error: r.error
            })),
            borderColor: color.border,
            backgroundColor: color.bg,
            tension: 0.1
        };
    });

    // Calculate statistics
    const stats = executions.map(execution => {
        const validResults = execution.results.filter(r => r.timeMs !== null);
        const times = validResults.map(r => r.timeMs);
        
        return {
            tag: execution.tag,
            avgTime: times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0,
            maxTime: times.length ? Math.max(...times) : 0,
            minTime: times.length ? Math.min(...times) : 0,
            errors: execution.results.filter(r => r.error).length
        };
    });

    return {
        // Chart.js compatible format
        chartData: {
            labels: inputSizes,
            datasets: datasets
        },
        // Raw data for custom visualization
        raw: executions,
        // Statistics
        stats: stats,
        // Metadata
        meta: {
            language: lang,
            totalExecutions: executions.reduce((sum, exec) => sum + exec.results.length, 0),
            inputSizes: inputSizes
        }
    };
}

/**
 * Analyze time complexity based on execution results
 * Returns predicted complexity (O(n), O(n log n), O(n^2), etc.)
 */

module.exports = { generateGraphData };
