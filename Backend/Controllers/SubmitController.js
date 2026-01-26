const {executor} = require("../Services/Executor");
const {generateGraphData} = require("../Services/GraphService");
const {createJob, updateJobStatus, JobStatus} = require("../Services/JobQueue");
const crypto = require("crypto");

async function codeGen(req, res) {
    const {code, lang, tags, imports, inputType, customTestCases} = req.body;

    if (!code || !lang) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    const normalizedTags = Array.isArray(tags) ? tags.filter(t => t !== 'custom') : [];
    const normalizedCustom = Array.isArray(customTestCases)
        ? customTestCases.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim())
        : [];

    const hasTagTests = normalizedTags.length > 0;
    const hasCustomTests = normalizedCustom.length > 0;
    const wantsCustom = Array.isArray(tags) && tags.includes('custom');

    if (!hasTagTests && (!wantsCustom || !hasCustomTests)) {
        return res.status(400).json({ error: "Select test case types or provide custom test cases" });
    }

    // Normalize imports: allow string or array of strings
    let importList = [];
    if (typeof imports === 'string') {
        importList = imports.trim() ? [imports.trim()] : [];
    } else if (Array.isArray(imports)) {
        importList = imports.filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean);
    }

    // Default to int[] if not specified
    const dataType = inputType || 'int[]';

    const jobId = crypto.randomUUID();

    // Create job immediately
    createJob(jobId, {
        code,
        lang,
        tags: normalizedTags,
        imports: importList,
        inputType: dataType,
        customTestCases: normalizedCustom,
        wantsCustom
    });

    // Return jobId immediately - processing happens in background
    res.status(202).json({
        jobId,
        status: JobStatus.QUEUED,
        message: "Job queued for processing"
    });

    // Process asynchronously
    processJob(jobId, {
        code,
        lang,
        normalizedTags,
        importList,
        dataType,
        normalizedCustom,
        hasTagTests,
        wantsCustom,
        hasCustomTests
    });
}

async function processJob(jobId, params) {
    const {code, lang, normalizedTags, importList, dataType, normalizedCustom, hasTagTests, wantsCustom, hasCustomTests} = params;
    
    try {
        updateJobStatus(jobId, JobStatus.PROCESSING);
        
        const executions = [];

        // Execute code for tags with auto-generated inputs (if tags provided)
        if (hasTagTests) {
            const tagExecutions = await Promise.all(
                normalizedTags.map(tag => executor({ 
                    jobId, 
                    code, 
                    lang, 
                    tag, 
                    imports: importList,
                    inputType: dataType,
                    customTestCases: [] // Don't mix custom with tag-based executions
                }))
            );
            executions.push(...tagExecutions);
        }

        // Execute custom test cases separately (if provided)
        if (wantsCustom && hasCustomTests) {
            const customExecution = await executor({
                jobId,
                code,
                lang,
                tag: 'custom',
                imports: importList,
                inputType: dataType,
                customTestCases: normalizedCustom
            });
            executions.push(customExecution);
        }

        // Generate graph data
        const graphData = generateGraphData(executions, lang);

        updateJobStatus(jobId, JobStatus.COMPLETED, {
            result: {
                jobId,
                language: lang,
                executions,
                graphData,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Execution error:', error);
        updateJobStatus(jobId, JobStatus.FAILED, {
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
}

async function getJobStatus(req, res) {
    const {jobId} = req.params;
    const {getJob} = require("../Services/JobQueue");
    
    const job = getJob(jobId);
    
    if (!job) {
        return res.status(404).json({
            error: "Job not found",
            message: "Job may have expired or does not exist"
        });
    }
    
    const response = {
        jobId: job.id,
        status: job.status,
        createdAt: job.createdAt
    };
    
    if (job.status === JobStatus.COMPLETED) {
        response.result = job.result;
    } else if (job.status === JobStatus.FAILED) {
        response.error = job.error;
    } else if (job.status === JobStatus.PROCESSING) {
        response.message = "Job is being processed";
    }
    
    return res.status(200).json(response);
}


module.exports = { codeGen, getJobStatus };