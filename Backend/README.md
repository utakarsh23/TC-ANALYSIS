# DSA Runtime Analysis System

A LeetCode-style system for analyzing algorithm runtime complexity. Submit code in Java/C++/Python, run it with various test cases, and get performance graphs.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env if needed
```

### 3. Run Server
```bash
# Local execution (no Docker required)
npm start

# With Docker (recommended for production)
docker build -t dsa-runtime:latest .
USE_DOCKER=true npm start
```

### 4. Test API
```bash
curl -X POST http://localhost:9092/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "code": "void solve(vector<int>& arr) { sort(arr.begin(), arr.end()); }",
    "lang": "cpp",
    "tags": ["sorted", "random"]
  }'
```

## API Endpoint

**POST** `/api/submit`

**Request:**
```json
{
  "code": "string",        // User's algorithm code
  "lang": "cpp|java|python", // Language
  "tags": ["sorted", "random"] // Test case types
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "language": "cpp",
  "executions": [...],      // Raw timing data
  "graphData": {...},       // Chart.js compatible data
  "complexityAnalysis": [...] // O() predictions
}
```

## Supported Languages

- **C++**: Write a `solve(vector<int>& arr)` function
- **Java**: Write a `static void solve(int[] arr)` function
- **Python**: Write a `solve(arr)` function

## How It Works

1. Code is injected into language-specific boilerplate
2. Executed with test cases of sizes: 100, 1K, 10K, 100K, 1M
3. Execution time measured in nanoseconds
4. Results aggregated into graph data
5. Time complexity analyzed and predicted

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Development

```bash
# Run in dev mode
npm run dev

# Build Docker image
docker build -t dsa-runtime:latest .
```

## License

ISC
