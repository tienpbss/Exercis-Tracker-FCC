const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const UserModel = require('./user-model');
const ExerciseModel = require('./exercise-model');
const { count } = require('./user-model');

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
  try {
    const {username} = req.body;
    const saveUser = await UserModel.create({username: username});
    res.send(saveUser);
  } catch (error) {
    res.status(500).send(error);
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find().select({_id: 1, username: 1});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { ':_id': _id, description, duration  } = req.body;
  const date = (req.body.date)?new Date(req.body.date).toDateString():new Date().toDateString()
  try {
    const saveExercise = {
      date: date,
      duration: parseInt(duration),
      description: description
    }
    const user = await UserModel.findById(_id);
    user.exercises.push(saveExercise);
    const saveUser = await user.save();
    res.send({
      "_id": _id,
      "username": saveUser.username,
      ...saveExercise
    })
  } catch (error) {
    res.send(error);
  }
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const _id = req.params._id;
  try {
    let user = await UserModel.findById(_id).select('-exercises._id');
    user = user.toObject()
    user.count = user.exercises.length
    user.log = user.exercises
    delete user.exercises
    res.send(user)
    
  } catch (error) {
    
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
