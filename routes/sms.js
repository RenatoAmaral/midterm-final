//https://www.twilio.com/docs/guides/how-to-receive-and-reply-in-node.js
//https://www.twilio.com/console/sms/getting-started/build/order-notifications
//https://www.twilio.com/docs/libraries/node
//vary important, every time you restart ngrok need to update twilio account  with http and /sms
//https://www.twilio.com/docs/quickstart/node/programmable-sms#allow-twilio-to-talk-to-your-nodejs-application-with-ngrok
// twilio parameters
//https://www.twilio.com/docs/api/twiml/sms/overview#generating-twiml-with-the-twilio-helper-libraries
'use strict';


//twilio number 1 647 699 7847

const sendText          = require("../public/scripts/twilioFunctions.js")
const http              = require('http');
const express           = require('express');
const router            = express();
// const accountSid          = 'AC76eb6ee8590a47c08cd0564696b08a95'; // Your Account SID from www.twilio.com/console

// const authToken           = require('./confidential.js').twilioToken;   // Your Auth Token from www.twilio.com/console

// const twilio              = require('twilio');
// const client              = new twilio(accountSid, authToken);

const MessagingResponse = require('twilio').twiml.MessagingResponse;
const sendMessage = require('../public/scripts/twilioFunctions')
const dbFunctions = require('./dbfunctions.js')

let currentUser;
let data = "empty";

module.exports = (knex) => {

router.get('/data', (req, res) => {
 res.send(data)
})

//needs to respond to user if
// reactive response to restaurant
//if we have time add a response to 'cancel from restaurant'
 router.post('/sms', (req, res, next) => {

   const twiml = new MessagingResponse();
//right now will only find integers nad not string numbers

   let findTime = req.body.Body.match(/\d/g)
   let pickupTime = '';
   console.log('this is the message body' + req.body.From)
   function cooktime(){
     return new Promise(function(resolve, reject){
       //condition1
       for (let num of findTime){
        pickupTime += num;
     }
       return resolve(pickupTime)
     })
   }
   cooktime().then(function(result){
     //message to restaurant
     //message to customer
    dbFunctions.getAllCustomerData(currentUser).then(function(rows){
       data = pickupTime;
       twiml.message(`Thank you, customer will be by in ${pickupTime} minutes`);
       let phone = rows[0].phone_number;
       sendMessage.notifyOrderConfirmed(phone, pickupTime);
       res.writeHead(200, {'Content-Type': 'text/xml'});
       res.end(twiml.toString());
    }).catch(function(err){
      console.log(err);
    })

   })
   .catch(function(err){
     //message to restaurant
     twiml.message(`Please reply with a valid pickup time in minutes`);
     console.log(err)
     res.writeHead(200, {'Content-Type': 'text/xml'});
     res.end(twiml.toString())
   })
 });

 router.post('/charge', (req, res) => {
    sendText.notifyRestaurant(req.body)
    currentUser = req.body.new_user;
    res.send(req.body);
  });

return router
}
