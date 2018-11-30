var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").curationsConnections; 
var chooseConnection = require("../dbHelpers");

// Get Curations
router.get('/:username/:page', function(req,res){
  var sC = chooseConnection(connection, 0, connection.length);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    var page = parseInt(req.params.page) === 0 ? 1 : parseInt(req.params.page);
    var amount = 2500;
    var pagination = page <= 1 ? 0 : (page - 1) * amount;
    request.input('username', req.params.username);
    request.input('amount', sql.Int, amount);
    request.input('pagination', sql.Int, pagination);
    request.query(`
        (
          SELECT COUNT(*) as 'count'
          FROM VOCurationRewards (NOLOCK) 
          WHERE "curator" = @username
        )
        (
          SELECT
            "timestamp",
            "author",
            "permlink",
            "reward"
          FROM 
            VOCurationRewards (NOLOCK)
          WHERE
            "curator" = @username
        )
        ORDER BY timestamp DESC 
        OFFSET 
          @pagination ROWS 
        FETCH NEXT @amount ROWS ONLY
      `
    ).then(function (results) {
        var max = results.recordsets[0][0].count
        var data = {
          page: page,
          max: max,
          has_more: pagination < (max - amount),
          curations: results.recordsets[1],
          username_from_data: req.params.username
        }
        res.status(200).send(data)
      connection[sC].close();
    }).catch(function(err){
      console.log(err);
      connection[sC].close();
    })
  }).catch(function(err) {
    console.log(err);
  })
})

module.exports = router