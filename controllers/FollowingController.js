var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").followingConnections; 
var chooseConnection = require("../dbHelpers");

// Get Following
router.get('/:username/:page', function(req, res) { 
  var sC = chooseConnection(connection, 0, connection.length);
  connection[sC].connect().then(function () {
    var page = parseInt(req.params.page) === 0 ? 1 : parseInt(req.params.page);
    var amount = 5000;
    var pagination = page <= 1 ? 0 : (page - 1) * amount;
    var request = new sql.Request(connection[sC]);
    request.input('username', req.params.username);
    request.input('amount', sql.Int, amount);
    request.input('pagination', sql.Int, pagination);
    request.query(`
        (
          SELECT COUNT(*) as 'count'
          FROM Followers (NOLOCK) 
          WHERE "follower" = @username
        )
        (
          SELECT 
            Followers.following,
            Accounts.sbd_balance,
            Accounts.balance,
            Accounts.reputation,
            Accounts.vesting_shares,
            Accounts.received_vesting_shares,
            Accounts.delegated_vesting_shares,
            Accounts.voting_power,
            Accounts.post_count,
            Accounts.last_root_post

          FROM Followers (NOLOCK) 

          INNER JOIN Accounts
          ON Followers.following = Accounts.name

          WHERE "follower" = @username
          
        )
        ORDER BY Followers.following ASC 
        OFFSET 
          @pagination ROWS 
        FETCH NEXT @amount ROWS ONLY
      `
    ).then(function (results) {
        var max = results.recordsets[0][0].count
        var data = {
          page: page,
          max: max,
          // Pagination (801) < Total Followers (900) - Amount (500) = FALSE
          // Pagination (1) < Total Followers (900) - Amount (500) = TRUE
          has_more: pagination < (max - amount),
          following: results.recordsets[1],
          username_from_data: req.params.username
        }
        res.status(200).send(data)

        connection[sC].close();
    }).catch(function (err) {
        console.log(err);
        connection[sC].close();
    });
  }).catch(function (err) {
      console.log(err);
  });
})

module.exports = router;