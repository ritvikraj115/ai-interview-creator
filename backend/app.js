const express = require('express');
const connectDB = require('./database');
const User = require('./userSchema');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the CORS middleware

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    methods: ['GET', 'POST','PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(bodyParser.json());
app.use(require('./router/auth'))

// Connect to MongoDB
connectDB();

// Route to create a new user

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
