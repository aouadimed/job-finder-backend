const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");

const dbConnection = require("./config/db");
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const initializeSocket = require("./socket");

const app = express();
/// CORS : enable other domain to access api 
app.use(cors());
app.options("*", cors());

/// Compression
app.use(compression());

dotenv.config({ path: "config.env" });
// Routes
const mountRoutes = require("./routes");

// ?  Connect to db
dbConnection();

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount Routes
mountRoutes(app);

app.get("/", (req, res) => {
  res.json({ message: "Here we go !👌👌 " });
});

app.use("*", (req, res, next) => {
  next(new ApiError(`cannot find ${req.originalUrl} on this server !`, 400));
});

// * Global error Handling middleware
app.use(globalError);

const server = app.listen(process.env.PORT, "0.0.0.0", () =>
  console.log(`Server is listen to port ${process.env.PORT} 🤷‍♂️🤷‍♂️`)
);


initializeSocket(server);

// ? Handle Rejection outside Express !
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error : ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting Down ... `);
    process.exit(1);
  });
});