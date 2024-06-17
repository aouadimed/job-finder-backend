const { extractResumeDataFromPDF } = require('../utils/pdfPraser');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // File name with timestamp
    }
}); 

const upload = multer({ storage: storage });



async function parseResume(req, res, next) {
    try {
        upload.single('pdf')(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return next(err);
            } else if (err) {
                return next(err);
            }
            const pdfFilePath = req.file.path;

            const resumeData = await extractResumeDataFromPDF(pdfFilePath);
            if (resumeData) {
                res.json({ success: true, data: JSON.parse(resumeData) });
            } else {
                throw new Error('Failed to extract resume data.');
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { parseResume };
