const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  author: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: String,
  amount: String,
  createdAt: Date,
});

module.exports = mongoose.model('Expense', expenseSchema);
