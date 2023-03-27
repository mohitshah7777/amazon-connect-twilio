const ENV = require("./env");
require('dotenv').config();


const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "ap-southeast-1",
  signatureVersion: 'v4',
});

const TwilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = { AWS, TwilioClient };
