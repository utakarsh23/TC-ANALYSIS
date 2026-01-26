// Simple in-memory job queue
const jobs = new Map();

const JobStatus = {
    QUEUED: 'queued',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

function createJob(jobId, payload) {
    jobs.set(jobId, {
        id: jobId,
        status: JobStatus.QUEUED,
        payload,
        result: null,
        error: null,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null
    });
    return jobs.get(jobId);
}

function getJob(jobId) {
    return jobs.get(jobId);
}

function updateJobStatus(jobId, status, data = {}) {
    const job = jobs.get(jobId);
    if (!job) return null;
    
    job.status = status;
    
    if (status === JobStatus.PROCESSING) {
        job.startedAt = new Date();
    } else if (status === JobStatus.COMPLETED) {
        job.completedAt = new Date();
        job.result = data.result;
    } else if (status === JobStatus.FAILED) {
        job.completedAt = new Date();
        job.error = data.error;
    }
    
    return job;
}

function deleteJob(jobId) {
    jobs.delete(jobId);
}

// Clean up old jobs (> 30 minutes to prevent loss of completed jobs)
setInterval(() => {
    const now = Date.now();
    for (const [jobId, job] of jobs.entries()) {
        if (now - job.createdAt.getTime() > 30 * 60 * 1000) {
            jobs.delete(jobId);
        }
    }
}, 60000); // Run every minute

module.exports = {
    createJob,
    getJob,
    updateJobStatus,
    deleteJob,
    JobStatus
};
