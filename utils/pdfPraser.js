// pdfUtils.js

const fs = require('fs');
const PDFParser = require('pdf-parse');
const ResumeParser = require('resume-parser');

// Function to extract resume data from a PDF file
async function extractResumeDataFromPDF(pdfFilePath) {
 /*   console.log(`../${pdfFilePath.replace("\\","/")}`);
   await ResumeParser
   .parseResumeFile(`../${pdfFilePath.replace("\\","/")}`, '../uploads/compiled') // input file, output dir
   .then((file ) => {
     console.log("Yay! " + file );
   })
   .catch(error => {
     console.error(error);
   });*/

   ResumeParser
  .parseResumeUrl('http://localhost:5000/Text-Resume-Amazon-Associate.txt') // url
  .then(data => {
    console.log('Yay! ', data);
  })
  .catch(error => {
    console.error(error);
  });
//return extractedData;
}

// Function to extract relevant resume data from parsed PDF data
function extractResumeData(pdfData) {
   // From file to file
ResumeParser
.parseResumeFile(pdfData, './files/compiled') // input file, output dir
.then(extractedData => {
  console.log("Yay! " + extractedData);
})
.catch(error => {
  console.error(error);
});


    return extractedData;
}

module.exports = { extractResumeDataFromPDF };
