const mongoose = require('mongoose');

// Define the schema for the resume
const resumeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    education: {
        type: [String],
        default: []
    },
    experience: {
        type: [String],
        default: []
    },
    // You can add more fields as needed
});

// Create the Resume model using the schema
const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
