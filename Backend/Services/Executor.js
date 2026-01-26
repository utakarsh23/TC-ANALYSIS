const { injectBoilerplate } = require("./inject");
const { run } = require("./runner");
const crypto = require("crypto");

async function executor({ jobId, code, lang, tag, imports = [], inputType = 'int[]', sampleInput, customTestCases = [] }) {
    // Test with different input sizes: 10^2, 10^3, 10^4, 10^5, 10^6
    const inputSizes = [100, 1000, 10000, 100000, 1000000];
    
    const results = [];

    // If custom test cases provided, use those instead
    if (customTestCases.length > 0) {
        for (let i = 0; i < customTestCases.length; i++) {
            const input = customTestCases[i];
            const sourceCode = injectBoilerplate(lang, code, imports, inputType);

            try {
                const result = await run({
                    lang,
                    sourceCode,
                    input,
                    jobId: `${jobId}-custom-${i}`
                });

                results.push({
                    inputSize: `Custom ${i + 1}`,
                    timeNs: result.time_ns,
                    timeMs: result.time_ns / 1000000
                });
            } catch (error) {
                results.push({
                    inputSize: `Custom ${i + 1}`,
                    error: error.message,
                    timeNs: null,
                    timeMs: null
                });
            }
        }
    } else {
        // Use standard input sizes with generated data
        for (const size of inputSizes) {
            const input = generateInput(tag, size, inputType, sampleInput);
            const sourceCode = injectBoilerplate(lang, code, imports, inputType);

            try {
                const result = await run({
                    lang,
                    sourceCode,
                    input,
                    jobId: `${jobId}-${tag}-${size}`
                });

                results.push({
                    inputSize: size,
                    timeNs: result.time_ns,
                    timeMs: result.time_ns / 1000000
                });
            } catch (error) {
                results.push({
                    inputSize: size,
                    error: error.message,
                    timeNs: null,
                    timeMs: null
                });
            }
        }
    }

    return {
        tag,
        results
    };
}

// Generate input based on type, tag, and size
function generateInput(tag, n, inputType = 'int[]', sampleInput) {
    // If sample input provided, use it as template
    if (sampleInput) {
        return sampleInput;
    }

    switch(inputType) {
        case 'int':
            return generateSingleInt(tag, n);
        case 'long':
            return generateSingleLong(tag, n);
        case 'string':
            return generateString(n);
        case 'int[]':
            return generateIntArray(tag, n);
        case 'long[]':
            return generateLongArray(tag, n);
        case 'string[]':
            return generateStringArray(tag, n);
        case 'char[]':
            return generateCharArray(tag, n);
        default:
            return generateIntArray(tag, n);
    }
}

function generateSingleInt(tag, max) {
    return Math.floor(Math.random() * max).toString();
}

function generateSingleLong(tag, max) {
    return (BigInt(Math.floor(Math.random() * max)) * 1000n).toString();
}

function generateString(n) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < Math.min(n, 1000); i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function generateIntArray(tag, n) {
    let arr;
    
    switch(tag.toLowerCase()) {
        case 'sorted':
            arr = Array.from({ length: n }, (_, i) => i + 1);
            break;
        case 'reverse':
        case 'reverse-sorted':
            arr = Array.from({ length: n }, (_, i) => n - i);
            break;
        case 'unsorted':
        case 'random':
        default:
            arr = Array.from({ length: n }, () => Math.floor(Math.random() * n));
            break;
    }
    
    return `${n}\n${arr.join(" ")}`;
}

function generateLongArray(tag, n) {
    let arr;
    
    switch(tag.toLowerCase()) {
        case 'sorted':
            arr = Array.from({ length: n }, (_, i) => (i + 1) * 1000);
            break;
        case 'reverse':
        case 'reverse-sorted':
            arr = Array.from({ length: n }, (_, i) => (n - i) * 1000);
            break;
        case 'unsorted':
        case 'random':
        default:
            arr = Array.from({ length: n }, () => Math.floor(Math.random() * n * 1000));
            break;
    }
    
    return `${n}\n${arr.join(" ")}`;
}

function generateStringArray(tag, n) {
    const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];
    let arr;
    
    switch(tag.toLowerCase()) {
        case 'sorted':
            arr = Array.from({ length: n }, (_, i) => words[i % words.length] + i);
            arr.sort();
            break;
        case 'reverse':
        case 'reverse-sorted':
            arr = Array.from({ length: n }, (_, i) => words[i % words.length] + i);
            arr.sort().reverse();
            break;
        case 'unsorted':
        case 'random':
        default:
            arr = Array.from({ length: n }, () => words[Math.floor(Math.random() * words.length)]);
            break;
    }
    
    return `${n}\n${arr.join(" ")}`;
}

function generateCharArray(tag, n) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let arr;
    
    switch(tag.toLowerCase()) {
        case 'sorted':
            arr = Array.from({ length: n }, (_, i) => chars[i % chars.length]);
            break;
        case 'reverse':
        case 'reverse-sorted':
            arr = Array.from({ length: n }, (_, i) => chars[chars.length - 1 - (i % chars.length)]);
            break;
        case 'unsorted':
        case 'random':
        default:
            arr = Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]);
            break;
    }
    
    return `${n}\n${arr.join(" ")}`;
}

module.exports = { executor };