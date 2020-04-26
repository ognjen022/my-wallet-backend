const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  },
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense"
    }
  ],
  socialId: {
    type: String,
    default: null
  },
  token: {
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);
