// Example test file - You can test your setup with this

const testPayload = {
    code: `void solve(vector<int>& arr) {
    sort(arr.begin(), arr.end());
}`,
    lang: "cpp",
    tags: ["sorted", "random", "reverse"]
};

// Usage:
// curl -X POST http://localhost:9092/api/submit \
//   -H "Content-Type: application/json" \
//   -d @test-payload.json

console.log(JSON.stringify(testPayload, null, 2));
