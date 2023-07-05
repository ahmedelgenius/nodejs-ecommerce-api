const path = require("path");

const express = require("express");

const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const app = express();

// middleware
app.use(express.json());

app.use(express.static(path.join(__dirname, "uploads")));

const morgan = require("morgan");
const dbConnection = require("./config/database");
const categoryRoute = require("./routes/categoryRoute");
const subCategoryRoute = require("./routes/subCategoryRoute");
const brandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const reviewRoute = require("./routes/reviewRoute");
const wishlistRoute = require("./routes/wishlistRoute");
const addressRoute = require("./routes/addressRoute");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
//connection with database
dbConnection();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));

  console.log(`mode: ${process.env.NODE_ENV}`);
}

// mount route
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subcategories", subCategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/addresses", addressRoute);

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
