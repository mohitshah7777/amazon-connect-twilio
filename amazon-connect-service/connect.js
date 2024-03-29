const ENV = require("../config/env");
const { AWS } = require("../config/config");

const connect = new AWS.Connect();
const connectparticipant = new AWS.ConnectParticipant();

let initialiseChat = incomingData => {
  return new Promise((resolve, reject) => {
    const startChatParams = {
      InstanceId: process.env.CONNECT_INSTANCE_ID,
      ContactFlowId: process.env.CONNECT_CONTACT_FLOW_ID,
      ParticipantDetails: {
        DisplayName: incomingData.body.to
      },
      Attributes: {
        Channel: "CHAT"
      }
    };
    //ISSUE:: InitialMessage attribute sent on initiating chat connection is not working as per API, though 'InitialMessage' is mentioned as a required param works fine without it.
    //WORKAROUND:: Ugly hack done inorder to not miss the initial message by temporarily persisting them in DynamoDB and update them as '-SENT-' after manually forwarding the message.
    //SDK-REFERENCE:: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Connect.html#startChatContact-property
    connect.startChatContact(startChatParams, function (err, startChatResponse) {
      if (err) {
        console.log("Error::startChatContact", err);
        reject(err);
      } else {
        console.log("Success::startChatContact");
        const participantConnectionParams = {
          ParticipantToken: startChatResponse.ParticipantToken,
          Type: ["WEBSOCKET", "CONNECTION_CREDENTIALS"]
        };
        connectparticipant.createParticipantConnection(participantConnectionParams, function (err, participantConnectionResponse) {
          if (err) {
            console.log("Error::createParticipantConnection", err);
            reject(err);
          } else {
            console.log("Success::createParticipantConnection");
            resolve({ incomingData, startChatResponse, participantConnectionResponse });
          }
        }
        );
      }
    });
  });
};

//Forwards the message to Amazon Connect Chat Interface
let sendMessageToChat = ({ existingCustomer, incomingData }) => {
  return new Promise((resolve, reject) => {
    var sendMessageParams = {
      ConnectionToken: existingCustomer.connectionToken,
      Content: incomingData.body.body,
      ContentType: "text/plain"
    };
    connectparticipant.sendMessage(sendMessageParams, function (err, data) {
      if (err) {
        console.log("Error::sendMessageToChat", err);
        reject(err);
      } else {
        console.log("Success::sendMessageToChat");
        resolve(data);
      }
    });
  });
};

//Initiates an outgoing voice call between Customer and Agent
// let startOutboundCall = customerNumber => {
//   const destNumber = customerNumber.replace("whatsapp:", "");
//   const outboundParams = {
//     InstanceId: process.env.CONNECT_INSTANCE_ID,
//     ContactFlowId: process.env.CONNECT_CONTACT_FLOW_ID,
//     SourcePhoneNumber: process.env.CONNECT_SOURCE_NUMBER,
//     DestinationPhoneNumber: destNumber || process.env.CONNECT_DESTINATION_NUMBER,
//     Attributes: {
//       name: customerNumber
//     }
//   };
  // connect.startOutboundVoiceContact(outboundParams, function (err, data) {
  //   if (err) console.log("Error::startOutboundVoiceContact", err);
  //   else console.log("Success::startOutboundVoiceContact", data.ContactId);
  // });
// };

module.exports = { initialiseChat, sendMessageToChat};
