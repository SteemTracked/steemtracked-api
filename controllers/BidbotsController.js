var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").bidbotsConnections; 
var chooseConnection = require("../dbHelpers");

// Authentication
router.get('/:username', function(req, res) { 
  var sC = chooseConnection(connection, 0, connection.length)
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input('username', req.params.username);
    request.query(`
      SELECT TOP 1000
        "to",
        "amount",
        "amount_symbol",
        "memo",
        "timestamp"
      FROM 
        TxTransfers (NOLOCK)
      WHERE
        "from" = @username
      ORDER BY "timestamp" DESC
    `).then(function (result) {
        // No records
        if(result.recordset.length < 1){ 
          res.send([])
          return connection[sC].close()
        }
        var bidbotTransactions = result.recordset.filter(function(transaction){ 
          if(!transaction.memo) return false
          return transaction.memo.includes("https://steemit.com/") && transaction.memo.includes(req.params.username)
        })

        // Send 
        res.status(200).send(bidbotTransactions);

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