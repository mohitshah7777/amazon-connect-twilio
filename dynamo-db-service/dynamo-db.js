const ENV = require("../config/env");
const { AWS } = require("../config/config");
const docClient = new AWS.DynamoDB.DocumentClient();

let getRecordByNumber = async customerNumber => {
  const query = {
    TableName: process.env.TABLE_NAME,
    Key: {
      customerNumber
    }
  };
  return await docClient.get(query).promise();
};

let addCustomerRecord = ({ incomingData, startChatResponse, participantConnectionResponse }) => {
  return new Promise((resolve, reject) => {
    console.log("Incomming data ::::", incomingData.body);
    const query = {
      TableName: process.env.TABLE_NAME,
      Item: {
        initialMessage: incomingData.body.body,
        customerNumber: incomingData.body.to,
        contactId: startChatResponse.ContactId,
        participantId: startChatResponse.ParticipantId,
        connectionToken: participantConnectionResponse.ConnectionCredentials.ConnectionToken,
        connectionExpiry: participantConnectionResponse.ConnectionCredentials.Expiry
      }
    };

    console.log("query ::::", query );
    docClient.put(query, function (err, data) {
      if (err) {
        console.error("Error::addCustomerRecord", err);
        reject(false);
      } else {
        console.log("Success::addCustomerRecord");
        resolve(true);
      }
    });
  });
};

let getRecordByContactId = initialContactId => {
  return new Promise((resolve, reject) => {
    const query = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: "#contactId = :contactIdValue",
      ExpressionAttributeNames: {
        "#contactId": "contactId"
      },
      ExpressionAttributeValues: {
        ":contactIdValue": initialContactId
      }
    };
    docClient.scan(query, function (err, data) {
      if (err) {
        console.error("Error::getRecordByContactId", err);
        reject(false);
      } else {
        console.log("Success::getRecordByContactId");
        const { Items = [] } = data,
          [record] = Items;
        resolve(record);
      }
    });
  });
};

let updateRecordByCustomerNumer = customerNumber => {
  return new Promise((resolve, reject) => {
    const updateDbParams = {
      TableName: process.env.TABLE_NAME,
      Key: {
        customerNumber
      },
      UpdateExpression: "set initialMessage = :r",
      ExpressionAttributeValues: {
        ":r": "-SENT-"
      }
    };
    docClient.update(updateDbParams, function (err, data) {
      if (err) {
        console.error("Error::updateRecordByCustomerNumer", err);
        reject(false);
      } else {
        console.log("Success::updateRecordByCustomerNumer");
        resolve(true);
      }
    });
  });
};

module.exports = { getRecordByNumber, addCustomerRecord, getRecordByContactId, updateRecordByCustomerNumer };
