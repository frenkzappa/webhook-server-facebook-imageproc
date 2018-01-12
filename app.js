var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var webhookUtil = require('./bots-js-utils/webhook/webhookUtil.js');
var quagga = require(__dirname + '/quagga');

var FBlib = require('./FBLib.js');

var app = express();
var port = process.env.PORT;
var botURL = "http://140.86.14.175:8080/botsui/(botId:C4C4224A-1D0A-4CC7-8A54-623BDC48588B)/bot/intents";
var botID = "C4C4224A-1D0A-4CC7-8A54-623BDC48588B";

var facebook_webhook = "https://mediaset-imagebarcode.herokuapp.com/webhook";
var webhook_verify_token = "123456789";
var PAGE_ACCESS_TOKEN = "EAAFZAxQMdhuQBAC7EsnmYjnIP9COQjsBQbdvlGS35UgroSSpHXlnlBw660hud3ajZAY09dH4eUmDQY9LEAkriqNCDUZBCZBdFpy7ZCAmut95VnBvvnzYo0YMfQqUZA4wOQVRRwwNZAkyYLXLWBBGrSoxZBiASKjPHKTopa4wh4dgZAFL1xi54c6x8";
var PAGE_SECRET_KEY = "e01580964b27d3b4d20a8066eab03652";
var senderID = "1503067119808430";

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var metadata = {
	waitForMoreResponsesMs: 200,
	FacebookBotID: "494482767617258", // NEEDED BY WEBHOOK SERVER
	channelSecretKey: '4VPjkK5A9Rvc69U40Lndxq4mctBukFB6', // from bot ui channel webhook
	channelUrl: 'https://c8c68d92.ngrok.io/connectors/v1/tenants/chatbot-tenant/listeners/webhook/channels/838C7A55-3395-4120-AA79-DF2B55633904' // FACEBOOK CONNECTOR ADDRESS FOR THE SPECIFIC BOT
};


app.listen(port, () => {
  console.log('We are live on ' + port);
});


// ======== WEBHOOK VERIFICATION =============
app.get('/webhook', (req, res) => {
	
	  // Your verify token. Should be a random string.
	  let VERIFY_TOKEN = webhook_verify_token;
		
	  // Parse the query params
	  let mode = req.query['hub.mode'];
	  let token = req.query['hub.verify_token'];
	  let challenge = req.query['hub.challenge'];
		
	  // Checks if a token and mode is in the query string of the request
	  if (mode && token) {
	  
		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
		  
		  // Responds with the challenge token from the request
		  console.log('WEBHOOK_VERIFIED');
		  res.status(200).send(challenge);
		
		} else {
		  // Responds with '403 Forbidden' if verify tokens do not match
		  res.sendStatus(403);      
		}
	  }
	});



	// ========= WEBHOOK POST CHANNEL ==========
	app.post('/webhook', (req, res) => {  		 
		 let body = req.body;
		 var ispostBack = 0;
		 // SENDING TO BOT		 
		 console.log("PRINTING REQ: " + JSON.stringify(req.body));		 
		 if(req.body.entry[0].messaging[0].postback){
			// --- HANDLING GET STARTED BUTTON 
			if(req.body.entry[0].messaging[0].postback.payload == "Ciao"){
				console.log("POSTBACK INIZALE DOPO IL CLICK SU INIZIA");
				//console.log("printing user profile: " + JSON.stringify(FBlib.GetUserProfile("1503067119808430",PAGE_ACCESS_TOKEN)));				
				ispostBack = 1;
				console.log("ISpostBack", ispostBack);
				FBlib.FBsendTextMessage("1503067119808430", "Salve, come ti posso aiutare ?", PAGE_ACCESS_TOKEN);				   
			} else {
				console.log("INVIANDO POSTBACK AL BOT");
				var textToSend = req.body.entry[0].messaging[0].postback.payload;
				ispostBack = 1;
				var additionalProperties = { "userProfile": { "clientType": "Facebook" } };
				webhookUtil.messageToBotWithProperties(metadata.channelUrl, metadata.channelSecretKey, metadata.FacebookBotID, textToSend, additionalProperties, function(err) {			  
					if (err) {
							console.log('Failed to send message to bot.\n');
						}
					});
					
			    } 
		    }
			if((req.body.entry[0].messaging[0].sender) && (req.body.entry[0].messaging[0].message) && (ispostBack === 0) && !(req.body.entry[0].messaging[0].message.hasOwnProperty("attachments")) )
						{
							console.log("RICEVENDO MESSAGGIO DI TESTO O IMMAGINE");							
							console.log(JSON.stringify(req.body));
							console.log("FROM CHAT: " + JSON.stringify(req.body.entry[0].messaging[0].message.text));
							var additionalProperties = { "userProfile": { "clientType": "Facebook" } };
							var textToSend = req.body.entry[0].messaging[0].message.text;
							webhookUtil.messageToBotWithProperties(metadata.channelUrl, metadata.channelSecretKey, metadata.FacebookBotID, textToSend, additionalProperties, function(err) {			  
								if (err) {
										console.log('Failed to send message to bot.\n');
									}
								});
								
						} else {
							if(ispostBack === 0){
								if (req.body.entry[0].messaging[0].message.hasOwnProperty("attachments")){
									console.log("RECEIVING ONE IMAGE");
									quagga.BarCodeRecognition(req.body.entry[0].messaging[0].message.attachments[0].payload.url);																
								} else {
										console.log("FROM ORABOT: " + (req.body.entry[0].messaging[0].message));
										var outputText = (req.body.entry[0].messaging[0].message);
										FBlib.FBsendTextMessage("1503067119808430", outputText, PAGE_ACCESS_TOKEN);									
										}
								}
							}
					
		 var command = req.body.text;
		 var additionalProperties = { "userProfile": { "clientType": "Facebook" } };
		 
		 if (body.object === 'page') {	   
		   
		   body.entry.forEach(function(entry) {			 
			 let webhookEvent = entry.messaging[0];
			 console.log(webhookEvent);
		   });
	   
		   // Returns a '200 OK' response to all requests
		   res.status(200).send('EVENT_RECEIVED');
		 } else {
		   // Returns a '404 Not Found' if event is not from a page subscription
		   res.sendStatus(404);
		   console.log(JSON.stringify(body));
		 }		
	});

	// =========== PROCESSING BOT RESPONSE ---- DIFFERENT HANDLING BASED ON TEXT, LIST OR PAYLOAD
	 	app.post('/botReply', (req, res)=>{			
		if (req.body.text && !(req.body.choices)) {
			console.log("Hey you entered a simple TEXT response");
			var botReply = {
				"object": "page",
				 "entry": [
					 {
					 	"messaging": [
							 {
								"message": req.body.text
							}]
					}]
				};			
			 request.post({
				uri: facebook_webhook,
				headers: {
					'Content-Type':'application/json'
				},
				body: JSON.stringify(botReply)},
			function(err, response, body) {
				if (!err) {					
				} else {
					console.log(response);
					console.log(body);
					console.log(err);
					callback(err);
					}
				}
			);		
		} 
		// ---- RECEIVING A LIST FROM BOT ENGINE ----
		if (req.body.choices)
		{
			console.log("Hey you entered a LIST type response");
			console.log(req.body.choices);
			console.log(JSON.stringify(req.body.choices));
			FBlib.FBsendGenericButtons(senderID, "Sai con quale decoder guardi Mediaset Premium?", ["Si","No"], PAGE_ACCESS_TOKEN);				
		}
		res.sendStatus(200);
	})
