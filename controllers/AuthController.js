var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").authConnections; 
var chooseConnection = require("../dbHelpers");

// Authentication
router.get('/:username', function(req, res) { 
  var sC = chooseConnection(connection, 0, connection.length)
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input('username', req.params.username);
    request.query(`
      SELECT TOP 1
        "timestamp", 
        "amount" 
      FROM 
        TxTransfers (NOLOCK)
      WHERE
        "from" = @username AND
        "to" = 'steemtracked' AND
        (
          "timestamp" >=  DATEADD(year, -1, GETDATE()) AND
          "amount" = 10  
        OR
          "timestamp" >=  DATEADD(month, -1, GETDATE()) AND
          "amount" = 2
        )
      ORDER BY "timestamp" DESC
    `).then(function (result) {
        // No records
        if(result.recordset.length < 1){ 
          res.send(false)
          return connection[sC].close()
        }
        
        // Get Record
        var record = result.recordset[0];
        // Get Record Date
        var recordDate = new Date(record.timestamp)
        // Get Expire Date
        var expires_in = new Date((new Date(recordDate)).setMonth(recordDate.getMonth()+1));

        var daysLeft = Math.round((expires_in-new Date())/(1000*60*60*24))
        
        // Send Expiry and Subscription Type
        res.status(200).send({
          expires_in: expires_in.toUTCString(),
          subscription: record.amount === 10 ? "Annually" : "Monthly",
          daysLeft: daysLeft
        });

        connection[sC].close();
    }).catch(function (err) {
        console.log(err);
        connection[sC].close();
    });
  }).catch(function (err) {
      console.log(err);
      connection[sC].close();
  });
})

module.exports = router;