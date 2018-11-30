var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").projectionsConnections 
var chooseConnection = require("../dbHelpers");

// Get Projections
router.get('/:username', function(req, res) { 
  var sC = chooseConnection(connection, 0, connection.length);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input('username', req.params.username);
    request.query(`
        (
          SELECT
            "created"
          FROM
            Accounts (NOLOCK)
          WHERE
            "name" = @username
        )
        (
          SELECT
            "total_payout_value",
            "pending_payout_value",
            "net_votes",
            "created",
            "children"
          FROM 
            Comments (NOLOCK)
          WHERE
            "author" = @username AND
            "depth" = 0
        )
      `
    ).then(function (results) {
        res.status(200).send({
          created: results.recordsets[0][0].created,
          posts: results.recordsets[1].map(function(post){ 
            return {
              created: post.created,
              earnings_count: parseFloat(post.total_payout_value)+parseFloat(post.pending_payout_value),
              upvotes_count: post.net_votes,
              comments_count: post.children,
            }
          })
        });
        connection[sC].close();
    }).catch(function (err) {
        console.log(err);
        connection[sC].close();
    });
  }).catch(function (err) {
      console.log(err);
  });
})


module.exports = router