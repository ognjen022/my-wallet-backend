const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cryptoRandomString = require('crypto-random-string');
const User = require('../models/User');
const axios = require('axios');

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
    process.env.JWT_PRIVATE_KEY
  );
}

exports.login = async (req, res) => {
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
};
