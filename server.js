const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const React = require("react");
const mysqlssh = require("mysql-ssh");
const config = require("./config.js"); //import connection data

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Make Connection
function connection() {
  return mysqlssh.connect(config.sshpw, config.sqlpw);
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

app.get("/trains", function(req, res) {
  let q = "SELECT * FROM Trains";
  let result = [];
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) throw err;
        if (data) result = data;
        res.send(JSON.stringify(result));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log(err);
    });
});

//Listen to Port
app.listen(3001, function() {
  console.log("Server running on 3001");
});
