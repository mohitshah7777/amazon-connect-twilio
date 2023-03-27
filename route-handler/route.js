const Database = require("../dynamo-db-service/dynamo-db");
const ConnectService = require("../amazon-connect-service/connect");
const Websocket = require("../websocket-client-service/websocket-client");

let sendWhatsappMessageToConnect = async req => {
  try {
    const incomingData = req;
    // console.log(incomingData.body);
    const existingCustomer = await Database.getRecordByNumber(incomingData.body.to);
    const existingSocket = Websocket.activeClients.find(s => s.customerNumber === incomingData.customerNumber);

    if (!existingSocket || !existingCustomer || new Date(existingCustomer.connectionExpiry) < new Date()) {
      const connectionInfo = await ConnectService.initialiseChat(incomingData);
      // console.log("connectionInfo :: ", connectionInfo);
      const savedCustomer = await Database.addCustomerRecord(connectionInfo);
      const socketData = {
        websocketUrl: connectionInfo.participantConnectionResponse.Websocket.Url,
        customerNumber: incomingData.body.to
      };
      savedCustomer && Websocket.establishConnection(socketData);
    } else {
      // //Initiates an outgoing voice call between Customer and Agent when the respective message content matches
      // if (incomingData.Body === "call me")
      //   ConnectService.startOutboundCall(existingCustomer.customerNumber);
      const sentMessage = await ConnectService.sendMessageToChat({ existingCustomer, incomingData });
      sentMessage 
      // && Database.updateRecordByCustomerNumer(existingCustomer.customerNumber);
    }
  } catch (err) {
    console.log("Error::sendWhatsappMessageToConnect", err);
  }
};

module.exports = { sendWhatsappMessageToConnect };
