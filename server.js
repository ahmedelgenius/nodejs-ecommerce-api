const path = require("path");

const express = require("express");
const compression = require("compression");
const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const app = express();

//enable other domains access to your application
app.use(cors());
app.options("*", cors());

// compression all response
app.use(compression());

// middleware
app.use(express.json());

app.use(express.static(path.join(__dirname, "uploads")));

const morgan = require("morgan");
const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const mountRoute = require("./routes");
//connection with database
dbConnection();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));

  console.log(`mode: ${process.env.NODE_ENV}`);
}

// mount route
mountRoute(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route : ${req.originalUrl} `, 400));
});
// global error handling middleware
app.use(globalError);
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message} `);
  server.close(() => {
    console.error("shutting down");
    process.exit(1);
  });
});
