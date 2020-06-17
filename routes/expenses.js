const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getExpenses,
  createExpense,
  editExpense,
  deleteExpense,
} = require('../controllers/expenses-controller');

router.get('/', auth, getExpenses);

router.post('/', auth, createExpense);

router.put('/:id', auth, editExpense);

router.delete('/:id', auth, deleteExpense);

module.exports = router;
