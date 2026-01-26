const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const crypto = require("crypto");
const { getLangConfig } = require("./inject");

// Set to true to use Docker, false for local execution
const USE_DOCKER = process.env.USE_DOCKER === 'true';
const DOCKER_IMAGE = process.env.DOCKER_IMAGE || 'dsa-runtime:latest';

async function run({ lang, sourceCode, input, jobId }) {
    const conf = getLangConfig(lang);
    const id = jobId || crypto.randomUUID();
    
    if (USE_DOCKER) {
        return runInDocker({ lang, sourceCode, input, id, conf });
    } else {
        return runLocally({ lang, sourceCode, input, id, conf });
    }
}

async function runLocally({ lang, sourceCode, input, id, conf }) {
    const dir = `/tmp/job-${id}`;

    fs.mkdirSync(dir, { recursive: true });

    try {
        const filePath = path.join(dir, conf.file);
        fs.writeFileSync(filePath, sourceCode);

        if (conf.compile) {
            console.log(`[RUNNER-${id}] Compiling ${lang} code...`);
            try {
                await execAsync(conf.compile, { cwd: dir });
                console.log(`[RUNNER-${id}] Compilation successful`);
            } catch (compileErr) {
                console.error(`[RUNNER-${id}] Compilation failed:`, compileErr.message);
                throw compileErr;
            }
        }

        console.log(`[RUNNER-${id}] Running ${lang} code with input size: ${input.length} bytes`);
        const { stdout, stderr } = await execAsync(conf.run, {
            cwd: dir,
            input,
            timeout: conf.timeoutMs
        });

        if (stderr) {
            console.log(`[RUNNER-${id}] Execution stderr:`, stderr);
        }

        return {
            time_ns: Number(stdout.trim())
        };
    } catch (error) {
        console.error(`[RUNNER-${id}] Execution error:`, error.message);
        throw error;
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

async function runInDocker({ lang, sourceCode, input, id, conf }) {
    const hostDir = `/tmp/job-${id}`;
    const containerDir = '/sandbox';

    fs.mkdirSync(hostDir, { recursive: true });

    try {
        const filePath = path.join(hostDir, conf.file);
        fs.writeFileSync(filePath, sourceCode);

        // Compile if needed
        if (conf.compile) {
            const compileCmd = `docker run --rm \
                -v "${hostDir}:${containerDir}" \
                -w ${containerDir} \
                --memory=512m \
                --cpus=1 \
                ${DOCKER_IMAGE} \
                /bin/bash -c "${conf.compile}"`;
            
            await execAsync(compileCmd);
        }

        // Run the program
        const runCmd = `docker run --rm \
            -v "${hostDir}:${containerDir}" \
            -w ${containerDir} \
            --memory=512m \
            --cpus=1 \
            --network=none \
            ${DOCKER_IMAGE} \
            /bin/bash -c "echo '${input.replace(/'/g, "\\'")}' | ${conf.run}"`;

        const { stdout } = await execAsync(runCmd, {
            timeout: conf.timeoutMs
        });

        return {
            time_ns: Number(stdout.trim())
        };
    } finally {
        fs.rmSync(hostDir, { recursive: true, force: true });
    }
}

function execAsync(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
        const childProcess = exec(cmd, {
            cwd: opts.cwd,
            timeout: opts.timeout,
            maxBuffer: 10 * 1024 * 1024 // 10MB
        }, (err, stdout, stderr) => {
            if (err) {
                let errorDetails = `Command: ${cmd}\n`;
                if (stdout) errorDetails += `Stdout: ${stdout}\n`;
                if (stderr) errorDetails += `Stderr: ${stderr}\n`;
                errorDetails += `Error: ${err.message}`;
                return reject(new Error(errorDetails));
            }
            resolve({ stdout, stderr });
        });

        if (opts.input) {
            childProcess.stdin.write(opts.input);
            childProcess.stdin.end();
        }
    });
}

module.exports = { run };