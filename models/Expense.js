const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  id: String,
  name: String,
  amount: String,
  createdAt: Date
})

module.exports = mongoose.model("Expense", expenseSchema);