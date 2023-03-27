const express = require("express");
const bodyParser = require("body-parser");
const Route = require("./route-handler/route");
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/", function(req, res) {
  // console.log("EVENT :: ", req.body)
  Route.sendWhatsappMessageToConnect(req);
  res.send("sending").status(200);
});

app.post("/status-callback", function(req, res) {
  res.sendStatus(204);
});

app.get("/", function(req, res) {
  res.send("I am alive :)");
});

app.listen(3000, function() {
  console.log("SERVER_RUNNING_ON_PORT::3000");
});
