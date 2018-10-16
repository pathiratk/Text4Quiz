const Message = require('../models/message.model');
const User = require('../models/user.model');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const welcomeText = "Welcome to Text4Quiz\nPress 1 to register for our quiz application";
exports.sms = function (req, res) {
  // parse the message 
  var body = req.body.Body;
  var number = req.body.From;
  var reply = "";

  var mathProblem1 = "Anna has 5 apples. Bob has 3 apples more than Anna. How many apples does Bob have?\n1. 8\n2. 2";
  var mathSol1 = "1";
  var mathCorrect1 = "Correct! Bob has 5+3=8 apples";
  var mathWrong1 = ":( The correct answer is 8. Bob has 5+3=8 apples";

  var englishProblem1 = "What is the synonym of enormous?\n1. Minuscule\n2. Gigantic";
  var englishSol1 = "2";
  var englishCorrect1 = "Correct! Gigantic and enormous are adjectives which means large. Minuscule means small";
  var englishWrong1 = ":( Minuscule means small. Gigantic and enormous are adjectives which means large.";

  console.log("--Receiving new message from " + number + ": " + body);
  saveMessage(body, number);
  User.find({"number": number}, function(err, user) {
    if (err) {
      console.log(err);
    }
    // if this is a new user
    if (user.length == 0) {
      console.log("Welcome new user!");
      sendMessage(welcomeText, res);
      let user = new User(
        {
          number: number
        }
      );
      user.save(function (err) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Added new user");
      });

    } else {
      // if this is a returning user
      console.log("Welcome back returning user!");
      var mathQ = user[0].progress.math;
      var englishQ = user[0].progress.english;
      console.log(user[0].status);
      // get status
      User.find({"number": number}, function(err, user) {
        if (err) {
          return;
        }
        var status = user[0].status;
        if (status == "registering") {
          console.log("This user is registering for the service");
          // register for the service, send confirmation
          // if failed, send welcometext
          if (body == '1') {
            User.findOneAndUpdate({"number": number}, {$set: {"status" : "idle"}}, function(err) {
              if (err) {
                return;
              }
              console.log("Registration complete");
            });
            sendMessage("You are registered for Text4Quiz. Send \"Math\" for math quiz and send \"English\" for English quiz", res);
          } else {
            sendMessage(welcomeText, res);
            console.log("Message Error. Resending the welcome message");
          }
        } else if (status == "idle") {
          // send the problem the user is asking
          // if msg is invalid, send instruction
          console.log("The user asks for a new problem");
          if (body.toLowerCase() == "math") {
            User.findOneAndUpdate({"number": number}, {$inc: {"progress.math" : 1}, $set: {"currentQ": "math", "status": "waiting"}}, function(err) {
              if (err) {
                return;
              }
              if (mathQ == 0) {
                sendMessage(mathProblem1, res);
              } else {
                sendMessage("math problem #" + (mathQ + 1), res);
              }
              console.log("Sent a math problem");
            });
          } else if (body.toLowerCase() == "english") {
            User.findOneAndUpdate({"number": number}, {$inc: {"progress.english" : 1}, $set: {"currentQ": "english", "status": "waiting"}}, function(err) {
              if (err) {
                return;
              }
              if (englishQ == 0) {
                sendMessage(englishProblem1, res);
              } else {
                sendMessage("English problem #" + (englishQ + 1), res);
              }
              console.log("Sent an English problem");
            });
          } else {
            sendMessage("Send \"Math\" for math quiz and send \"English\" for English quiz", res);
            console.log("Message Error. Resending the instruction");
          }
        } else if (status == "waiting") {
          // check the answer, send sol
          // if failed, send sol
          
          var currentQ = user[0].currentQ;
          // this is hard-coded. the model of quiz problems is not implemented yet
          User.findOneAndUpdate({"number": number}, {$set: {"status": "idle", "currentQ": ""}}, function(err) {
            if (err) {
              console.log(err);
            }
            if (currentQ == "math" && mathQ == 1) {
              if (body == mathSol1) {
                sendMessage(mathCorrect1, res);
              } else {
                sendMessage(mathWrong1, res);
              }
            } else if (currentQ == "english" && englishQ == 1) {
              if (body == englishSol1) {
                sendMessage(englishCorrect1, res);
              } else {
                sendMessage(englishWrong1, res);
              }
            } else {
              sendMessage("The answer is correct!", res);
            }
            console.log("Sent the solution");
          });
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

