require('dotenv').config();
const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');

// setup mongoose connection
const mongoose = require('mongoose');
let mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// routing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const message = require('./routes/message.route');
app.use('/sms', message);

// create a port for listening to the messages from clients
app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});

// backend website for view logs
app.get('/log', (req, res) => {
  res.send("hello world");
})


