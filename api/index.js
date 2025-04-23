require("dotenv").config();

const express = require("express");
const generalRoutes = require("../src/routes/index");
const cookieParser = require("cookie-parser");
const connectDb = require("../src/db/index");
const cors = require("cors");
const app = express();
const errorHandler = require("../src/middleware/errorHandler");

app.use(
  cors({
    origin: [
      "http://localhost:3000",  // Local development on port 3000
      "http://localhost:3001",  // Local development on port 3001
      "https://inventory-client-ebon.vercel.app", // Your production client
    ],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  })
);


connectDb();
const PORT = process.env.PORT;

// Set up Multer middleware for handling file uploads
// Use the Multer middleware in your app
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1", generalRoutes());

app.use('/api/v1/test', (req, res) => {
  res.json("Hello world");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server is Running");
});
