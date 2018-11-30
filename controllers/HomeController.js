var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").homeConnections; 
var chooseConnection = require("../dbHelpers");

// Get Counts
router.get('/counts/:username', function(req, res) { 
  var sC = chooseConnection(connection, 0, 2);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        (SELECT COUNT(*) as 'posts_count' FROM Comments (NOLOCK) 
        WHERE "author" = @username and "depth" = 0 and "title" != '')
        (SELECT COUNT(*) as 'comments_count' FROM Comments (NOLOCK) 
        WHERE "author" = @username and "depth" > 0)
        (SELECT COUNT(*) as 'followers_count' FROM Followers (NOLOCK)
        WHERE "following" = @username)
        (SELECT COUNT(*) as 'following_count' FROM Followers (NOLOCK)
        WHERE "follower" = @username)
      `
    ).then(function (results) {
        // No records
        if(results.recordset.length < 1){ 
          res.send({
            posts_count: 0, 
            comments_count: 0,
            followers_count: 0,
            following_count: 0
          })
          return connection[sC].close()
        }
        
        res.status(200).send({
          posts_count: results.recordsets[0][0].posts_count,
          comments_count: results.recordsets[1][0].comments_count,
          followers_count: results.recordsets[2][0].followers_count,
          following_count: results.recordsets[3][0].following_count
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

// Get Summary 
router.get('/summary/:username', function(req, res) { 
  var sC = chooseConnection(connection, 4, 6);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        (
          SELECT "total_payout_value", "pending_payout_value", "created", "net_votes", "children" FROM Comments (NOLOCK) 
          WHERE "author" = @username and 
          "depth" = 0 and
          "created" >=  DATEADD(day, -28, GETDATE())
        ) ORDER BY "created" ASC
        (
          SELECT "total_payout_value", "pending_payout_value", "created", "net_votes", "children" FROM Comments (NOLOCK) 
          WHERE "author" = @username and 
          "depth" = 0 and
          "created" >=  DATEADD(day, -56, GETDATE()) and
          "created" <=  DATEADD(day, -28, GETDATE())
        ) ORDER BY "created" ASC
      `
    ).then(function (results) {
        var last28 = {
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0.0,
          data: []
        }

        var prev28 = {
          posts_count: 0,
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0.0,
        }

        // No records
        if(results.recordset.length < 1){ 
          res.send({last28: last28, prev28: prev28})
          return connection[sC].close()
        }

        results.recordsets[0].forEach(function(item){
          last28.comments_count += item.children;
          last28.upvotes_count += item.net_votes;
          last28.earnings_count += (parseFloat(item.total_payout_value)+parseFloat(item.pending_payout_value));
          var obj = {x: item.created, y: (parseFloat(item.total_payout_value)+parseFloat(item.pending_payout_value))}
          last28.data.push(obj);
        })

        prev28.posts_count = results.recordsets[1].length;

        results.recordsets[1].forEach(function(item){
          prev28.comments_count += item.children;
          prev28.upvotes_count += item.net_votes;
          prev28.earnings_count += (parseFloat(item.total_payout_value)+parseFloat(item.pending_payout_value));
        })

        res.status(200).send({
          last28: {
            posts_count: results.recordsets[0].length,
            comments_count: last28.comments_count,
            upvotes_count: last28.upvotes_count,
            earnings_count: last28.earnings_count,
            data: last28.data
          },
          prev28:{
            posts_count: results.recordsets[1].length,
            comments_count: prev28.comments_count,
            upvotes_count: prev28.upvotes_count,
            earnings_count: prev28.earnings_count
          }
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


module.exports = router;