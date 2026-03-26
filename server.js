const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const messagesFile = path.join(__dirname, "messages.json");
const usersFile = path.join(__dirname, "users.json");

// Ensure files exist
if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, "[]");
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]");

// Contact Form Handler
app.post("/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    const newMessage = { name, email, subject, message, timestamp: new Date() };

    const messages = JSON.parse(fs.readFileSync(messagesFile));
    messages.push(newMessage);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

    res.status(200).json({ message: "Message received successfully!" });
});

// Register Handler
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const users = JSON.parse(fs.readFileSync(usersFile));
    const userExists = users.find(u => u.email === email);

    if (userExists) {
        return res.status(400).json({ error: "User already registered." });
    }

    users.push({ name, email, password }); // You can hash the password in real apps
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.status(200).json({ message: "Registration successful!" });
});

// Login Handler
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    res.status(200).json({ message: "Login successful!", name: user.name });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});