const mongoose = require('mongoose');
const jobCategories = require('./utils/jobCategory.list');
const Category = require('./models/jobCategory.model');

const MONGO_URI = "";

mongoose
  .set({ strictQuery: false })
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected!");

    // Insert the job categories
    Category.insertMany(jobCategories)
      .then(() => {
        console.log('Job categories inserted successfully');
        mongoose.connection.close();
      })
      .catch(err => {
        console.error('Error inserting job categories:', err);
        mongoose.connection.close();
      });

  })
  .catch(err => {
    console.error('Connection error', err);
  });
