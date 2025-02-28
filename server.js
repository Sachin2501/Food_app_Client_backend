const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require("cors");
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB connected...'))
    .catch((err) => console.log(err));

// Register API
app.post('/register', async (req, res) => {
    console.log("Register Request Received:", req.body);  // Debugging

    const { username, email, password } = req.body;  

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });

        await user.save();
        res.json({ message: "User Registered Successfully" });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});



// Login API
app.post('/login', async (req, res) => {
    console.log("Login Request Received:", req.body);  // Debugging

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found:", email);  // Debugging
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password incorrect for:", email);  // Debugging
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        console.log("Login Successful for:", email);  //  Debugging
        res.json({ message: "Login Successful", username: user.username });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log("Server running on port:", PORT);
});
