const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const React = require("react");
const mysqlssh = require("mysql-ssh");
const config = require("./config.js"); //import connection data

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Make Connection
function connection() {
  return mysqlssh.connect(
    {
      host: config.sshpw.host,
      port: config.sshpw.port,
      username: config.sshpw.username,
      password: config.sshpw.password
    },
    {
      host: config.sqlpw.host,
      user: config.sqlpw.user,
      password: config.sqlpw.password,
      database: config.sqlpw.database
    }
  );
}

//Test Connection
connection()
  .then(client => {
    client.query("SELECT * FROM Trains", function(err, results, fields) {
      if (err) throw err;
      console.log(results[0]);
      mysqlssh.close();
    });
  })
  .catch(err => {
    console.log(err);
  });

//Get Stations
app.get("/stations", function(req, res) {
  let q = "SELECT * FROM Stations";
  let result = [];
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("STATIONQUERY: " + err);
        if (data) result = data;
        res.send(JSON.stringify(result));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("STATIONS: " + err);
    });
});

//Submit Selection and Get Available Trains
app.post("/getTrains",function(req,res){
  let date = req.body.date.toString().slice(0,10);
  let from = req.body.stationfrom;
  let to = req.body.stationto;
  let time = req.body.time;
  let day = ((req.body.day == 0 || req.body.day == 6) ? 'SSH' : 'MF' );
  let q = "call get_avail_trains('"+date+"','"+from+"','"+to+"','"+time+"','"+day+"',@some_trains);";
  let result = [];
  console.log(q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("AVAILTRAINSQ: " + err);
        if (data) result = data;
        console.log(data);
        res.send(JSON.stringify(result));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("AVAILTRAINSC: " + err);
    });
});

//Listen to Port
app.listen(3001, function() {
  console.log("Server running on 3001");
});
