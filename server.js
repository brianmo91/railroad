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

//Get Checkout Information
app.get("/getCheckout", function(req, res) {
  let q = 'select a.train_id, travel_date as date, start_station, st1.station_name as start_name, s1.time_out as start_time, end_station, st2.station_name as end_name, s2.time_in as end_time, fare';
  q += ' from avail_trains a left join stops_at s1 on a.train_id=s1.train_id and a.start_station=s1.station_id';
  q += ' join stops_at s2 on a.train_id=s2.train_id and a.end_station=s2.station_id';
  q += ' join Stations st1 on a.start_station=st1.station_id';
  q += ' join Stations st2 on a.end_station=st2.station_id';
  q += ' where chosen=1;'
  let result = {};
  console.log("CHECKOUT: " + q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("CHECKOUTQUERY: " + err);
        if (data[0]) result = data[0];
        console.log('CC: '+JSON.stringify(result));
        res.send(JSON.stringify(result));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("CHECKOUT: " + err);
    });
});

app.post("/purchaseTicket",function(req,res){
  let f_name = req.body.f_name;
  let l_name = req.body.l_name;
  let address = req.body.address;
  let email = req.body.email;
  let fare = req.body.fare;
  let discounttype = req.body.discounttype;
  let pet = req.body.pet;
  let q = "call get_ticket('"+f_name+"','"+l_name+"','credit','"+address+"','"+email+"',"+fare+",'"+discounttype+"',"+pet+",@trip_ok);";
  console.log(q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("PURCHASE Q: " + err);
        console.log('PURCHASE:'+JSON.stringify(data));
        res.send(JSON.stringify(data));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("PURCHASE C: " + err);
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
        console.log(data);

        q = 'select a.train_id, start_station, s1.time_out as start_time, end_station, s2.time_in as end_time, fare';
        q += ' from avail_trains a left join stops_at s1 on a.train_id=s1.train_id and a.start_station=s1.station_id';
        q += ' join stops_at s2 on a.train_id=s2.train_id and a.end_station=s2.station_id;';
        console.log(q);

            client.query(q, function(err, data) {
              if (err) console.error("AVAILTRAINSQ: " + err);
              if (data) result = data;
              console.log(data);
              res.send(JSON.stringify(result));
              mysqlssh.close();
            });

      });
    })
    .catch(err => {
      console.error("AVAILTRAINSC: " + err);
    });
});

//Select Train to reserve
app.post("/selectTrain",function(req,res){
  let q = "update avail_trains set chosen=1 where train_id="+req.body.train_id+";";
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("SELECTTRAIN Q: " + err);
        console.log('SELECTTRAIN:'+data.info);
        res.send(JSON.stringify(data));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("SELECTTRAIN C: " + err);
    });
});

//Listen to Port
app.listen(process.env.PORT || 3001, function() {
  console.log("Server running on 3001");
});
