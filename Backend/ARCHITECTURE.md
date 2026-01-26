# DSA Runtime Analysis System - Architecture

## Overview
A LeetCode-style system that allows users to submit DSA code, executes it with multiple test cases, measures runtime, and generates performance graphs to compare against theoretical time complexity.

## System Architecture

```
┌──────────────┐
│   Frontend   │
│  (React/Vue) │
└──────┬───────┘
       │ POST /api/submit
       │ { code, lang, tags }
       ▼
┌──────────────────────────────────────────┐
│           Backend (Node.js)              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   SubmitController.js              │ │
│  │   - Validates input                │ │
│  │   - Generates jobId                │ │
│  │   - Orchestrates execution         │ │
│  └───────────┬────────────────────────┘ │
│              │                            │
│              ▼                            │
│  ┌────────────────────────────────────┐ │
│  │   Executor.js                      │ │
│  │   - Runs code for each tag         │ │
│  │   - Tests multiple input sizes:    │ │
│  │     10^2, 10^3, 10^4, 10^5, 10^6   │ │
│  │   - Generates test data            │ │
│  └───────────┬────────────────────────┘ │
│              │                            │
│              ▼                            │
│  ┌────────────────────────────────────┐ │
│  │   inject.js                        │ │
│  │   - Injects user code into         │ │
│  │     language boilerplate           │ │
│  │   - Adds timing instrumentation    │ │
│  └───────────┬────────────────────────┘ │
│              │                            │
│              ▼                            │
│  ┌────────────────────────────────────┐ │
│  │   runner.js                        │ │
│  │   - Executes code (Docker/Local)   │ │
│  │   - Enforces timeouts/limits       │ │
│  │   - Returns execution time         │ │
│  └───────────┬────────────────────────┘ │
│              │                            │
│              ▼                            │
│  ┌────────────────────────────────────┐ │
│  │   GraphService.js                  │ │
│  │   - Generates chart data           │ │
│  │   - Analyzes time complexity       │ │
│  │   - Calculates statistics          │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────┬───────────────────────────┘
               │
               ▼
     ┌──────────────────┐
     │  Docker Container│
     │  - Java JDK      │
     │  - G++ Compiler  │
     │  - Python 3      │
     │  - Isolated env  │
     └──────────────────┘
```

## Data Flow

### 1. Request
```json
{
  "code": "void solve(int[] arr) { /* user code */ }",
  "lang": "java",
  "tags": ["sorted", "unsorted", "random"]
}
```

### 2. Execution
For each tag:
- Generate test data (sorted/unsorted/random)
- Run with sizes: 100, 1K, 10K, 100K, 1M elements
- Measure execution time in nanoseconds

### 3. Response
```json
{
  "jobId": "uuid",
  "language": "java",
  "executions": [
    {
      "tag": "sorted",
      "results": [
        { "inputSize": 100, "timeNs": 1250000, "timeMs": 1.25 },
        { "inputSize": 1000, "timeNs": 15000000, "timeMs": 15.0 },
        ...
      ]
    }
  ],
  "graphData": {
    "chartData": { /* Chart.js format */ },
    "stats": [ /* per-tag statistics */ ]
  },
  "complexityAnalysis": [
    { "tag": "sorted", "analysis": { "complexity": "O(n log n)", "confidence": 85 } }
  ]
}
```

## Components

### Backend Services

#### 1. **SubmitController.js**
- Handles `/api/submit` endpoint
- Validates input (code, language, tags)
- Orchestrates execution pipeline
- Returns comprehensive results

#### 2. **Executor.js**
- Manages multi-size test execution
- Generates test inputs based on tags:
  - `sorted`: [1, 2, 3, ..., n]
  - `reverse`: [n, n-1, ..., 1]
  - `random`: random integers
- Handles errors gracefully

#### 3. **inject.js**
- Loads language templates from `languages.json`
- Injects user code into boilerplate
- Adds timing instrumentation (chrono/nanoTime/perf_counter)

#### 4. **runner.js**
- **Local mode**: Runs on host system
- **Docker mode**: Isolated container execution
- Resource limits: 512MB RAM, 1 CPU
- Network isolation for security
- Cleanup after execution

#### 5. **GraphService.js**
- Generates Chart.js-compatible data structures
- Calculates statistics (avg, min, max times)
- Analyzes time complexity by comparing growth ratios
- Returns confidence scores

### Language Support

Defined in `Boilerplate/languages.json`:

- **C++**: G++ with O2 optimization, `chrono` for timing
- **Java**: JDK 17, `System.nanoTime()` for timing
- **Python**: Python 3, `time.perf_counter_ns()` for timing

Each language template:
- Reads input (n, array)
- Calls user's `solve()` function
- Measures execution time
- Outputs time in nanoseconds

## Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Build Docker Image (Optional but Recommended)
```bash
cd Backend
docker build -t dsa-runtime:latest .
```

### 3. Environment Variables
Create `.env`:
```env
PORT=9092
USE_DOCKER=true
DOCKER_IMAGE=dsa-runtime:latest
CORS_ORIGIN=http://localhost:3000
```

### 4. Run Server
```bash
# Local execution (no Docker)
npm start

# With Docker
USE_DOCKER=true npm start
```

### 5. Test Endpoint
```bash
curl -X POST http://localhost:9092/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "code": "void solve(vector<int>& arr) { sort(arr.begin(), arr.end()); }",
    "lang": "cpp",
    "tags": ["sorted", "random"]
  }'
```

## Security Considerations

1. **Docker Isolation**: Code runs in isolated containers
2. **Resource Limits**: Memory and CPU caps prevent abuse
3. **Network Disabled**: No external network access
4. **Timeouts**: Prevents infinite loops
5. **Input Validation**: Strict payload validation

## Frontend Integration

Expected frontend features:
1. **Code Editor**: Monaco/CodeMirror with syntax highlighting
2. **Language Selector**: Dropdown for Java/C++/Python
3. **Tag Selector**: Checkboxes for test case types
4. **Graph Display**: Chart.js/Recharts for visualization
5. **Complexity Display**: Show predicted O() notation

### Sample Frontend Code
```javascript
const response = await fetch('http://localhost:9092/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: userCode,
    lang: selectedLang,
    tags: ['sorted', 'random']
  })
});

const result = await response.json();
// Use result.graphData.chartData with Chart.js
// Display result.complexityAnalysis
```

## Future Enhancements

1. **Job Queue**: Redis/Bull for async processing
2. **Database**: Store results in MongoDB
3. **Comparison**: Compare against theoretical curves
4. **Memory Profiling**: Track memory usage
5. **More Languages**: JavaScript, Go, Rust
6. **Custom Test Cases**: User-defined inputs
7. **Rate Limiting**: Prevent API abuse
8. **WebSocket**: Real-time execution updates

## File Structure
```
Backend/
├── index.js                 # Express server setup
├── package.json            # Dependencies
├── Dockerfile              # Multi-language container
├── .dockerignore          # Docker exclusions
├── Controllers/
│   └── SubmitController.js # Request handler
├── Routes/
│   └── SubmitRouter.js    # API routes
├── Services/
│   ├── Executor.js        # Execution orchestrator
│   ├── inject.js          # Code injection
│   ├── runner.js          # Code runner (Docker/Local)
│   └── GraphService.js    # Graph & analysis
├── Boilerplate/
│   └── languages.json     # Language templates
└── Middlewares/
    └── index.js           # JSON parser, etc.
```

## Troubleshooting

**Docker not found**: Install Docker Desktop or run in local mode (`USE_DOCKER=false`)

**Timeout errors**: Increase `timeoutMs` in `languages.json` or optimize code

**Memory errors**: Code might be allocating too much memory (>512MB limit)

**Compilation errors**: Check language-specific syntax in user code

## Notes
- Test cases generation is handled in `Executor.js` - you can customize it
- Graph data is Chart.js compatible but works with other libraries
- Complexity analysis is heuristic-based, not 100% accurate
- All timing is in nanoseconds for precision
