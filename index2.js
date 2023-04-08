//CODE AFTER CHAT GPT OPTIMIZE



/*
1. Use destructuring assignment for the req object in route handlers to avoid repetitive use of req.body, req.params, etc.
2. Use const instead of let for variables that are not reassigned.
3. Use async/await instead of .catch() for handling promises to make the code more concise and readable.
4. Use router instead of app for defining routes to take advantage of route handling in Express.
5. Remove unnecessary error logging and response sending in some places as it may result in duplicate error messages being sent to the client.
6. Use findOne instead of findById followed by a check for existence to improve performance and reduce database queries.
*/



// app.js

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const UserModel = require('./user-model');
const ExerciseModel = require('./exercise-model');
const { count } = require('./user-model');
const { urlencoded } = require('express');

require('dotenv').config();

const connectConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(process.env.MONGOOSE_URI, connectConfig);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', async (req, res) => {
  const {username} = req.body;
  try {
    const savedUser = await UserModel.create({username});
    res.send(savedUser);
  } catch (error) {
    console.log(error);
    res.send('err when save user');
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find().select('_id username');
    res.send(users);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const _id = req.params._id;
  const {description, duration, date} = req.body;
  
  if (!_id ) {
    res.send('not invalid id');
    return;
  }

  try {
    const user = await UserModel.findById(_id);
    if (!user) {
      res.send('err when find user');
      return;
    }
    user.log.push({
      description,
      duration,
      date: (date)? new Date(date).toDateString() : new Date().toDateString()
    });
    const savedUser = await user.save();
    res.send({
      _id,
      username: user.username,
      description,
      // duration, err because duration must be int. duration in the log.push auto parser to int
      duration: parseInt(duration),
      // date   //error of chat gpt must edit
      date: (date)? new Date(date).toDateString() : new Date().toDateString()
    });
  } catch (error) {
    console.log(error);
    res.send('err when save user');
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id
  const fromDate = req.query.from
  const toDate = req.query.to
  const user = await UserModel.findById(userId)
  const logs = user.log
  const limit = parseInt(req.query.limit) || logs.length
  const logResult = logs.filter(log => {
    return (!fromDate || new Date(fromDate) <= new Date(log.date))
      && (!toDate || new Date(toDate) >= new Date(log.date))
  }).slice(0, limit)

  res.json({
    _id: user._id,
    username: user.username,
    count: logResult.length,
    log: logResult
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

module.exports = app; // Export app for testing purposes
