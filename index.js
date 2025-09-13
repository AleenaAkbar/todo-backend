const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Todo = require("./models/todo");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

const SECRET = "todoProSecretKey"; // production mein env var use kare

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- MongoDB Connect --------------------
const MONGODB_URI = "mongodb+srv://alinaakbar8989_db_user:WM67jUcRxk50NUHj@todocluster.ltrzxza.mongodb.net/todoClusters?retryWrites=true&w=majority&appName=todoCluster";

// -------------------- Test Route --------------------
app.get("/", (req, res) => {
  res.send("Hello from Todo Backend 🚀");
});

// -------------------- AUTH ROUTES --------------------

// Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "Email already exists" });

    user = new User({ name, email, password });
    await user.save();
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1d" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- TODO ROUTES (AUTHENTICATED) --------------------

// Create Todo
app.post("/todos", auth, async (req, res) => {
  try {
    const { text, dueDate, priority } = req.body;
    const todo = new Todo({ text, dueDate, priority, user: req.user.userId });
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Todos
app.get("/todos", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Todo
app.delete("/todos/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Completed
app.put("/todos/:id/toggle", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.userId });
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Todo
app.put("/todos/:id", auth, async (req, res) => {
  try {
    const { text, dueDate, completed, priority } = req.body;
    const update = {};
    if (text !== undefined) update.text = text;
    if (dueDate !== undefined) update.dueDate = dueDate;
    if (completed !== undefined) update.completed = completed;
    if (priority !== undefined) update.priority = priority;

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      update,
      { new: true }
    );

    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- SERVER START --------------------
const PORT = 5000;
console.log("🚀 Starting server...");

// Start server first
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("📡 Attempting to connect to MongoDB...");
}).on('error', (err) => {
  console.log("❌ Server error:", err);
});

// Connect to MongoDB after server starts
setTimeout(() => {
  mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch((err) => {
      console.log("⚠️ MongoDB Error:", err.message);
      console.log("Server will continue without database connection");
    });
}, 1000);
