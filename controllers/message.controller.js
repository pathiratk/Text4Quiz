const Message = require('../models/message.model');
const User = require('../models/user.model');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const welcomeText = "Welcome to Text4Quiz\nPress 1 to register for our quiz application";
exports.sms = function (req, res) {
  // parse the message 
  var body = req.body.Body;
  var number = req.body.From;
  var reply = "";

  saveMessage(body, number);
  User.find({"number": number}, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (user.length == 0) {
      console.log("welcome new user");
      sendMessage(welcomeText, res);
      let user = new User(
        {
          number: number
        }
      );
      user.save(function (err) {
        if (err) {
          console.log(err);
          return false;
        }
        console.log("added new user");
      });

    } else {
      console.log("returning user");
      // get status
      User.find({"number": number}, function(err, user) {
        var status = user[0].status;
        var mathQ = user[0].progress.math;
        var englistQ = user[0].progress.english;
        if (status == "registering") {
          // register for the service, send confirmation
          // if failed, send welcometext
          if (body == '1') {
            User.findOneAndUpdate({"number": number}, {$set: {"status" : "idle"}}, function(err) {
              console.log("Registration complete");
            });
            sendMessage("You are registered for Text4Quiz. Send \"Math\" for math quiz and send \"English\" for English quiz", res);
          } else {
            sendMessage(welcomeText, res);
            console.log("sending welcomeText");
          }
        } else if (status == "idle") {
          console.log(body);
          if (body.toLowerCase() == "math") {
            User.findOneAndUpdate({"number": number}, {$inc: {"progress.math" : 1}, $set: {"status": "waiting"}}, function(err) {
              console.log("updated");
              sendMessage("math problem #1", res);
            });
          } else if (body.toLowerCase() == "english") {
            User.findOneAndUpdate({"number": number}, {$inc: {"progress.english" : 1}, $set: {"status": "waiting"}}, function(err) {
              console.log("updated");
              sendMessage("math problem #1", res);
            });
          } else {
            sendMessage("Send \"Math\" for math quiz and send \"English\" for English quiz", res);
          }
        } else if (status == "waiting") {
          // check the answer, send sol
          // if failed, resend the question
        }
      })
    }
  })
}

function sendMessage(reply, res) {
  const twiml = new MessagingResponse();
  twiml.message(reply);
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function saveMessage(content, number) {
  let msg = new Message(
    {
      number: number,
      content: content
    }
  );
  msg.save(function (err) {
    if (err) {
      console.log(err);
    }
  });
}

