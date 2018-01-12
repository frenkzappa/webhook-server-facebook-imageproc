 const login = require("facebook-chat-api");

// Create simple echo bot 
login({email: "camba_franco@yahoo.com", password: "FrenkZappa"}, (err, api) => {
   if(err) return console.error(err);

   api.listen((err, message) => {
    botID = "494482767617258";    
    api.sendMessage(message.body, message.threadID);
        //console.log(message.body);
        //console.log(message.threadID);
        console.log(JSON.stringify(message));
   });
});



/*
var login = require("facebook-chat-api");

login({
  email: "camba_franco@yahoo.com",
  password: "FrenkZappa"
}, function callback(err, api) {
  if (err) return console.error(err);

  var userID = "494482767617258";
  var msg = {
    body: "Hey! That's Node.js!"
  };
  api.sendMessage(msg, userID);
});

*/
