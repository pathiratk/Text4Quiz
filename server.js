require('dotenv').config();
const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT;

// setup mongoose connection
// const mongoose = require('mongoose');
// let dev_db_url = 'mongodb://someuser:abcd1234@ds123619.mlab.com:23619/productstutorial';
// let mongoDB = process.env.MONGODB_URI || dev_db_url;
// mongoose.connect(mongoDB);
// mongoose.Promise = global.Promise;
// let db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// routing
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


