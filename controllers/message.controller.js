const Message = require('../models/message.model');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

exports.sms = function (req, res) {
  // res.send('Hello from the test controller');
  const twiml = new MessagingResponse();

  twiml.message('Hello from controller');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

