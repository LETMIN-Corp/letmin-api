const Jobs = require('../models/jobs');

// Job CRUD
const insertJob = async (req, res) => {
    try {
        const job = new Jobs(req.body);
        await job.save();
        return res.json({
            message: 'Job inserted successfully',
            success: true,
            job,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
};

const getJobs = async (req, res) => {
    console.log(req.query);
    let company_id = req.query.company_id;
    try {
        const jobs = await Jobs.find({ company_id });
        return res.json({
            message: 'Jobs fetched successfully',
            success: true,
            jobs,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

const getJob = async (req, res) => {
    try {
        const job = await Jobs.findById(req.params.id);
        return res.json({
            message: 'Job fetched successfully',
            success: true,
            job,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

const updateJob = async (req, res) => {
    try {
        const job = await Jobs.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.json({
            message: 'Job updated successfully',
            success: true,
            job,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

const deleteJob = async (req, res) => {
    try {
        await Jobs.findByIdAndDelete(req.params.id);
        return res.json({
            message: 'Job deleted successfully',
            success: true,
        });
    } catch (err) {
        return res.status(400).json({
            message: err,
            success: false,
        });
    }
}

module.exports = {
    insertJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob,
};
