const ENV = require("../config/env");
const { TwilioClient } = require("../config/config");

// console.log(ENV);
let sendMessage = (content, customerNumber) => {
  console.log("CONTENT :;;;::", content, "customer number ::::: ",customerNumber);
  TwilioClient.messages
    .create({
      from: process.env.TWILIO_WHATSAPP_NUM,
      body: content,
      to: customerNumber
    })
    .then(message => console.log("Success::sendMessage", message.sid));
};

module.exports = { sendMessage };
