const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, // optional
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Todo", TodoSchema);
