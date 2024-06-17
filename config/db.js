const mongoose = require("mongoose");

/*
 * This code ensures that the MongoDB database connection is established before starting the Express.js server.
 * If the connection fails, the server will not start and the error will be logged to the console.
 */

const dbConnection = () => {
  mongoose
    .set({ strictQuery: false })
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected ! ");
    });
};

module.exports = dbConnection;