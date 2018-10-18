const Message = require('../models/message.model');
const User = require('../models/user.model');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const welcomeText = "Welcome to Text4Quiz! \
We have math and English quizzes for you to solve\!\n\
Send 1 to register for our service";

  
const regComplete = "You are registered for Text4Quiz!\n\
Send \“1\” or \"math\" for a math question,\n\
send \“2\” or \"eng\" for an English question,\n\
send “0” to see your stats";

const instruction = "Send \“1\” or \"math\" for a math question,\n\
send \“2\” or \"eng\" for an English question,\n\
send “0” to see your stats";

const mathProblem1 = "Anna has 5 apples. Bob has 3 apples more than Anna. How many apples does Bob have?\n1. 8\n2. 2";
const mathSol1 = "1";
const mathCorrect1 = "Correct! Bob has 5+3=8 apples";
const mathWrong1 = ":( The correct answer is 8. Bob has 5+3=8 apples";

const englishProblem1 = "What is the synonym of enormous?\n1. Minuscule\n2. Gigantic";
const englishSol1 = "2";
const englishCorrect1 = "Correct! Gigantic and enormous are adjectives which mean large. Minuscule means small.";
const englishWrong1 = ":( Minuscule means small. Gigantic and enormous are adjectives which means large.";

exports.sms = function (req, res) {
  // parse the message 
  var body = req.body.Body;
  var number = req.body.From;
  var reply = "";

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
      let user = new User({number: number});
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
      var mathQ = user[0].progress.math.current;
      var englishQ = user[0].progress.english.current;
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
            });
            sendMessage(regComplete, res);
            console.log("Registration complete");
          } else {
            sendMessage(welcomeText, res);
            console.log("Message Error. Resending the welcome message");
          }

        } else if (body == "0") {
          // sending the stats if the user sent 0
          var mAtt = user[0].progress.math.current;
          var mCor = user[0].progress.math.correct;

          var eAtt = user[0].progress.english.current;
          var eCor = user[0].progress.english.correct;
          sendMessage("“Math - Great job! You answered " + mCor + "\/" + mAtt +" correctly.\n\English - Excellent! you answered " + eCor + "\/" + eAtt +" correctly!”", res);
        } else if (status == "idle") {
          // send the problem the user is asking
          // if msg is invalid, send instruction
          console.log("The user asks for a new problem");
          if (body.toLowerCase() == "math" || body == "1") {
            User.findOneAndUpdate({"number": number}, {$inc: {"progress.math.current" : 1}, $set: {"currentQ": "math", "status": "waiting"}}, function(err) {
              if (err) {
                return;
              }
              mathQ +=1 ;
              if (mathQ == 1) {
                sendMessage(mathProblem1, res);
              } else {
                sendMessage("math problem #" + mathQ, res);
              }
              console.log("Sent a math problem");
            });
          } else if (body.toLowerCase() == "eng" || body == "2") {
            User.findOneAndUpdate({"number": number}, {$inc: {"progress.english.current" : 1}, $set: {"currentQ": "english", "status": "waiting"}}, function(err) {
              if (err) {
                console.log(err);
                return;
              }
              englishQ += 1;
              if (englishQ == 1) {
                sendMessage(englishProblem1, res);
              } else {
                sendMessage("English problem #" + englishQ, res);
              }
              console.log("Sent an English problem");
            });
          } else {
            sendMessage(instruction, res);
            console.log("Message Error. Resending the instruction");
          }

        } else if (status == "waiting") {
          // check the answer, send sol
          // if failed, send sol
          
          var currentQ = user[0].currentQ;
          if (body != "1" && body != "2") {
            if (currentQ == "math") {
              if (mathQ == 1) {
                sendMessage(mathProblem1, res);
              } else {
                sendMessage("math problem #" + (mathQ), res);
              }
            } else {
              if (englishQ == 1) {
                sendMessage(englishProblem1, res);
              } else {
                sendMessage("English problem #" + (englishQ), res);
              }
            }
            console.log("Message Error. Resending the problem");
            return;
          }
          // this is hard-coded. the model of quiz problems is not implemented yet
          User.findOneAndUpdate({"number": number}, {$set: {"status": "idle", "currentQ": ""}}, function(err) {
            if (err) {
              console.log(err);
            }
            if (currentQ == "math" && mathQ == 1) {
              if (body == mathSol1) {
                User.findOneAndUpdate({"number": number}, {$inc: {"progress.math.correct": 1}}, function(err) {
                  if (err){
                    console.log(err);
                  }
                  sendMessage(mathCorrect1, res);
                });
              } else {
                sendMessage(mathWrong1, res);
              }
            } else if (currentQ == "english" && englishQ == 1) {
              if (body == englishSol1) {
                User.findOneAndUpdate({"number": number}, {$inc: {"progress.english.correct": 1}}, function(err) {
                  if (err){
                    console.log(err);
                  }
                  sendMessage(englishCorrect1, res);
                })
              } else {
                sendMessage(englishWrong1, res);
              }
            } else {
              sendMessage(":( The answer is incorrect", res);
              console.log("The answer is incorrect");
            }
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

