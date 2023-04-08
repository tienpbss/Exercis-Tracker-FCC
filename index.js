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
  const savedUser = await UserModel.create({username})
    .catch(error => {
      res.send('err when save user')
      return error
    })
  if (!savedUser) {
    console.log(savedUser)
    return
  }
  res.send(savedUser)
})

app.get('/api/users', async (req, res) => {
  const user = await UserModel.find().select('_id username')
    .catch(err => {
      res.send(err);
      return
    })
  res.send(user)
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const _id = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = (req.body.date)?new Date(req.body.date).toDateString(): new Date().toDateString();

  if (!_id ) {
    res.send('not invalid id')
    return
  }

  const user = await UserModel.findById(_id)
    .catch(err => {
      console.log(err)
      return ''
    })
  if (!user) {
    res.send('err when find user')
    return
  }
  user.log.push({
    description,
    duration,
    date
  })

  const savedUser = await user.save()
    .catch(err => {
      console.log(err)
      return
    })
  if (!savedUser){
    res.send('err when save user')
    return
  }
  res.send({
    _id,
    username: user.username,
    description,
    duration,
    date
  })
})

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id
  const fromDate = req.query.from
  const toDate = req.query.to
  // const limit = req.query.limit
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
})


