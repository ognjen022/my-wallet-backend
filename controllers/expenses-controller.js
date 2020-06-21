const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get current user's expenses
// @route   GET /expenses
// @acess   Private
exports.getExpenses = async (req, res) => {
  const user = await User.findById(req.user);

  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  let allExpenses = [];
  for (let i = 0; i < user.expenses.length; i++) {
    let expense = await Expense.findById(user.expenses[i]);
    if (expense !== null) {
      allExpenses.push(expense);
    }
  }
  res.status(200).json(allExpenses);
};

// @desc    Add new expense
// @route   POST /expenses
// @acess   Private
exports.createExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const expense = await Expense.create({ ...req.body, author: req.user });
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await expense.save({ session: sess });
      user.expenses.push(expense);
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      res.status(500).json({ message: `Creating expense failed: ${err}` });
    }

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: `Server Error: ${err}` });
  }
};

// @desc    Edit an expense
// @route   PUT /expenses/:id
// @acess   Private
exports.editExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res
      .status(404)
      .json({ message: "Couldn't find expense with that id" });
  }

  if (expense.author.toString() !== req.user) {
    return res
      .status(401)
      .json({ message: 'You are not authorized to update this expense' });
  }

  let updatedExpense = {
    name: req.body.name,
    amount: req.body.amount,
  };

  await Expense.findOneAndUpdate({ _id: req.params.id }, updatedExpense, {
    returnNewDocument: true,
  });

  res.status(200).json({ message: 'Updated expense successfully' });
};

// @desc    Delete an expense
// @route   DELETE /expenses/:id
// @acess   Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res
        .status(404)
        .json({ message: "Couldn't find expense with that id" });
    }

    if (expense.author.toString() !== req.user) {
      return res
        .status(401)
        .json({ message: 'You are not authorized to delete this expense' });
    }

    await expense.remove();

    res.status(200).json({ message: 'Deleted expense successfully' });
  } catch (e) {
    res.status(400).send(e.message);
    console.log(e);
  }
};
