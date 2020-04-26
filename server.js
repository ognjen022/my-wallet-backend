const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const Expense = require('./models/Expense');
const axios = require('axios');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const cryptoRandomString = require('crypto-random-string');
const jwt = require('jsonwebtoken');

app.use(cors());
// app.options('*', cors());
app.use(express.json());

mongoose
  .connect(
    'mongodb+srv://ognjen022:cocacola123@cluster0-o2ghw.mongodb.net/expenses?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log(`Database connected`))
  .catch((err) => console.log(`Database connection error: ${err.message}`));

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });

async function registerUser(userData) {
  const user = new User({
    email: userData.email,
    password: userData.password,
    socialId: userData.socialId || null,
    socialType: userData.socialType || 'local',
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const newUser = await User.create(user);
  return newUser;
}

function generateAuthToken(user) {
  return jwt.sign(
    {
      _id: user._id,
    },
    'KITA'
  );
}

// app.get("/expenses", (req, res) => {
//   Expense.find({}, (err, expenses) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.status(200).json(expenses);
//     }
//   })
// });

app.get('/expenses/:id', async (req, res) => {
  await User.findById(req.params.id, async (err, user) => {
    if (err) {
      console.log(err);
    } else {
      let allExpenses = [];
      for (let i = 0; i < user.expenses.length; i++) {
        let expense = await Expense.findById(user.expenses[i]);
        if (expense !== null) {
          allExpenses.push(expense);
        }
      }
      res.status(200).json(allExpenses);
    }
  });
});

// app.get("/expenses/:id", (req, res) => {
//   Expense.findById(req.params.id, (err, foundExpense) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.status(200).json(foundExpense);
//     }
//   })
// });

app.post('/expenses/:id', async (req, res) => {
  await User.findById(req.params.id, async (err, user) => {
    if (err) {
      console.log(err);
    } else {
      await Expense.create(req.body, (err, expense) => {
        if (err) {
          console.log(err);
        } else {
          user.expenses.push(expense);
          user.save();
          res.status(200).json(expense);
        }
      });
    }
  });
});

// app.post("/expenses", async (req, res) => {
//   console.log(req.body)
//   const expense = {
//     author: req.body.author,
//     name: req.body.name,
//     amount: req.body.amount,
//     createdAt: req.body.createdAt
//   };
//   try {
//     const newExpense = await Expense.create(expense)
//     res.json(newExpense)
//   } catch (e) {
//     res.status(400).send(e.message)
//   }
// })

app.post('/expenses', async (req, res) => {
  await Expense.create(
    { ...req.body, author: req.body.author },
    (err, expense) => {
      if (err) {
        console.log(err);
      } else {
        user.expenses.push(expense);
        user.save();
      }
    }
  );
});

app.put('/expenses/:id', async (req, res) => {
  let updatedExpense = {
    name: req.body.name,
    amount: req.body.amount,
  };
  const updatedExpenseRes = await Expense.findOneAndUpdate(
    { _id: req.params.id },
    updatedExpense,
    { returnNewDocument: true }
  );
  res.send('OK');
});

app.delete('/expenses/:id', async (req, res) => {
  console.log(req.params.id);
  try {
    const delExpense = await Expense.findByIdAndDelete(req.params.id);
    res.send('OK');
  } catch (e) {
    res.status(400).send(e.message);
    console.log(e);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { data } = await axios.post(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${req.body.token.token}`
    );
    let user = await User.findOne({ socialId: data.user_id });
    if (user === null) {
      const generatedPassword = cryptoRandomString({
        length: 256,
        type: 'base64',
      });
      const userData = {
        email: data.email,
        password: generatedPassword,
        socialId: data.user_id,
      };
      user = await registerUser(userData);
    }
    const token = generateAuthToken(user);

    res.send({ token, email: data.email, userid: user._id });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.listen(5000, () => console.log('Server listening for requests.'));
