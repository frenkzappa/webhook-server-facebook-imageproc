var request = require('request');
var bodyParser = require('body-parser');


// Quick Reply builder, only pass an array of texts
function webhookPOST (senderID, payload, PAGE_ACCESS_TOKEN){
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
                    recipient: {id:senderID},
                    message: payload,
             }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }

// Quick Reply builder, only pass an array of texts
exports.QuickRepliesBuilder = function (senderID, text, arrayText,PAGE_ACCESS_TOKEN) {
    var repliesBuilder = []; 
    for (var i=0; i<arrayText.length; i++){
        var element = {
            "content_type" : "text",
            "title" : arrayText[i],
            "payload" : arrayText[i]
        };
    repliesBuilder.push(element);
    }

    var qr = {
        "text": text,
        "quick_replies": repliesBuilder
    };
    
    webhookPOST(senderID, qr, PAGE_ACCESS_TOKEN);
    return;
};

exports.GetUserProfile = function (PSID, PAGE_ACCESS_TOKEN) {
   var userProfile;
    request({
        url: 'https://graph.facebook.com/v2.6/'+PSID+'fields= first_name,last_name,gender&access_token='+PAGE_ACCESS_TOKEN+"'",
        method: 'GET'        
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            } else {
                userProfile = response.body;
            }
        })
        return userProfile;
};

// Function to send a simple Text to Facebook chat
exports.FBsendTextMessage = function(senderID, InputText, PAGE_ACCESS_TOKEN) {
    messageData = {
                text:InputText
            };
    webhookPOST(senderID, messageData, PAGE_ACCESS_TOKEN);            
    return;
};                

exports.FBsendGenericButtons = function(senderID, InputText, choicesArray, PAGE_ACCESS_TOKEN){
 var bottoni = [];
 for(var i=0; i < choicesArray.length; i++){
        var bottone = {
            "type":"postback",
            "title": choicesArray[i],
            "payload":choicesArray[i]
          } ; 
        bottoni.push(bottone);
    } 
 var message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": InputText,
        "buttons": bottoni
           }
       }
    }
    webhookPOST(senderID, message, PAGE_ACCESS_TOKEN);
};