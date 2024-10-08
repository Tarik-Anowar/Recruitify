const mongoose = require('mongoose');
const JobApplicationForm = require('../models/jobForms');
const Userauth = require("../models/userModel.js");
const catchAsyncErrors = require('../middleware/catchAsyncErrors.js');
const { compare } = require('bcryptjs');

exports.createJobForms = catchAsyncErrors(async (req, res) => {
    try {
        const userId = req.user._id;
        const { content } = req.body;

        const formDetails = {
            ownerProfile: userId,
            jobRole: content.jobRole || '',
            jobLocation: content.jobLocation || '',
            jobLocationType: content.jobLocationType || '',
            company: content.company || '',
            jobDescription: content.jobDescription || '',
            requiredSkills: content.requiredSkills || [],
            totalDuration: {
                value: content.totalDuration && content.totalDuration.value || undefined,
                mode: content.totalDuration && content.totalDuration.mode || undefined,
            },
            workingHours: {
                value: content.workingHours && content.workingHours.value || undefined,
                mode: content.workingHours && content.workingHours.mode || undefined,
            },
            salary: {
                value: content.salary && content.salary.value || undefined,
                currency: content.salary && content.salary.currency || undefined,
                mode: content.salary && content.salary.mode || undefined,
            },
        };

        if (content.salary && content.salary.mode && (!content.salary.value || !content.salary.currency)) {
            formDetails.salary = {};
        }

        if (content.totalDuration && content.totalDuration.mode === 'full-time') {
            formDetails.totalDuration.value = 0;
        } else if (content.totalDuration && content.totalDuration.mode && !content.totalDuration.value) {
            formDetails.totalDuration = {};
        }

        if (content.salary && content.salary.currency && (!content.salary.value || !content.salary.mode)) {
            formDetails.salary = {};
        }

        if (content.workingHours && !content.workingHours.value) {
            formDetails.workingHours = {};
        }

        const newJobForm = new JobApplicationForm(formDetails);
        const jobForm = await newJobForm.save();
        res.status(200).json(jobForm);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


exports.fetchMyJobForms = catchAsyncErrors(async (req, res) => {
    try {
        const userId = req.user._id;
        console.log("userid = " + userId);
        const jobForms = await JobApplicationForm.find({ ownerProfile: userId })
            .select('_id jobRole jobLocation company requiredSkills')
            .populate({
                path: 'ownerProfile',
                select: '_id name avatar.filePath'
            })
            .populate({
                path: 'applicantProfiles',
                select: '_id name avatar.filePath'
            })
            .sort({ timestamp: -1 });

        if (!jobForms || jobForms.length === 0) {
            return res.status(404).json({ error: "You haven't posted any job application..." });
        }
        res.status(200).json(jobForms);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


exports.fetchAllJobForms = catchAsyncErrors(async (req, res) => {
    try {
        const jobForms = await JobApplicationForm.find()
            .select('_id jobRole jobLocation company requiredSkills')
            .populate({
                path: 'ownerProfile',
                select: '_id name avatar.filePath'
            })
            .populate({
                path: 'applicantProfiles',
                select: '_id name avatar.filePath'
            })
            .sort({ timestamp: -1 });

        if (!jobForms || jobForms.length === 0) {
            return res.status(404).json({ error: 'Jobs not found' });
        }
        res.status(200).json(jobForms);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.fetchJobById = catchAsyncErrors(async (req, res) => {
    try {
        const id = req.params.id;
        const formData = await JobApplicationForm.findById(id)
            .populate('ownerProfile')
            .populate({
                path: 'applicantProfiles',
                select: '_id name avatar.filePath'
            });
        res.status(200).json(formData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
});


exports.applyForJob = catchAsyncErrors(async (req, res) => {
    try {
        const userId = req.user._id;
        console.log("applicant : "+userId);
        const {formId} = req.body;
        console.log(formId);
        const jobApplicationForm = await JobApplicationForm.findById(formId);

        if (!jobApplicationForm) {
            return res.status(404).json({ error: 'Job application form not found' });
        }

        if (jobApplicationForm.ownerProfile.equals(userId)) {
            return res.status(400).json({ error: 'You cannot apply to your own job' });
        }
        const hasApplied = jobApplicationForm.applicantProfiles.some(applicant => applicant.equals(userId));
        if (hasApplied) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }
        jobApplicationForm.applicantProfiles.push(userId);
        await jobApplicationForm.save();

        res.status(201).json({ message: 'Application successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

