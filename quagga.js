var Quagga = require('quagga').default;
//var result;
//var PAGE_ACCESS_TOKEN = "EAAFZAxQMdhuQBAC7EsnmYjnIP9COQjsBQbdvlGS35UgroSSpHXlnlBw660hud3ajZAY09dH4eUmDQY9LEAkriqNCDUZBCZBdFpy7ZCAmut95VnBvvnzYo0YMfQqUZA4wOQVRRwwNZAkyYLXLWBBGrSoxZBiASKjPHKTopa4wh4dgZAFL1xi54c6x8";


exports.BarCodeRecognition = function(img){
    var code ;
    var PAGE_ACCESS_TOKEN = "EAAFZAxQMdhuQBAC7EsnmYjnIP9COQjsBQbdvlGS35UgroSSpHXlnlBw660hud3ajZAY09dH4eUmDQY9LEAkriqNCDUZBCZBdFpy7ZCAmut95VnBvvnzYo0YMfQqUZA4wOQVRRwwNZAkyYLXLWBBGrSoxZBiASKjPHKTopa4wh4dgZAFL1xi54c6x8";
    var webhookUtil = require('./bots-js-utils/webhook/webhookUtil.js');
    var metadata = {
        waitForMoreResponsesMs: 200,
        FacebookBotID: "494482767617258", // from slack app credentials
        Page_ID: "1067280970047460",
        channelSecretKey: '4VPjkK5A9Rvc69U40Lndxq4mctBukFB6', // from bot ui channel webhook
        channelUrl: 'https://c8c68d92.ngrok.io/connectors/v1/tenants/chatbot-tenant/listeners/webhook/channels/838C7A55-3395-4120-AA79-DF2B55633904'
    };
    var additionalProperties = { "userProfile": { "clientType": "Facebook" } };
    Quagga.decodeSingle({
        src: img,
        numOfWorkers: 0,  // Needs to be 0 when used within node
        inputStream: {
            size: 800  // restrict input-size to be 800px in width (long-side)
        },
        decoder: {
            readers: ["code_128_reader"] // List of active readers
        },
    }, function(result) {
        if(result.codeResult) {
            console.log("code is:", result.codeResult.code);          
            webhookUtil.messageToBotWithProperties(metadata.channelUrl, metadata.channelSecretKey, metadata.FacebookBotID, result.codeResult.code, additionalProperties, function(err) {			  
                if (err) {
                        console.log('Failed to send message to bot.\n');
                    }
                });   
        } else {
            console.log("Codice non riconosciuto");
            webhookUtil.messageToBotWithProperties(metadata.channelUrl, metadata.channelSecretKey, metadata.FacebookBotID,"", additionalProperties, function(err) {			  
                if (err) {
                        console.log('Failed to send message to bot.\n');
                    }
                });
            console.log(JSON.stringify(result));
        }
    });
    
}

