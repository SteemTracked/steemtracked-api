var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").exportConnections; 
var chooseConnection = require("../dbHelpers");

// Export
router.get('/:username', function(req,res){
  var sC = chooseConnection(connection, 0, connection.length);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        (SELECT COUNT(*) as 'followers_count' FROM Followers (NOLOCK)
        WHERE "following" = @username)
        (SELECT COUNT(*) as 'following_count' FROM Followers (NOLOCK)
        WHERE "follower" = @username)
        (
          SELECT 
            "net_votes" as 'upvotes', 
            "pending_payout_value", 
            "total_payout_value", 
            "children" as 'comments', 
            "title"
          FROM 
            Comments (NOLOCK)
          WHERE
            "author" = @username AND
            "depth" = 0 AND
            MONTH("created") = MONTH(GETDATE()) AND 
            YEAR("created") = YEAR(GETDATE())
        ) ORDER BY 
            "created" DESC
      `
    ).then(function (result) {
      var posts = result.recordsets[2];

      var data = {
        follower_count: result.recordsets[0][0].followers_count,
        following_count: result.recordsets[1][0].following_count,
        posts: posts,
        earnings_this_month: 0,
        upvotes_this_month: 0,
        comments_this_month: 0,
        posts_this_month: posts.length,
        highest_earning_post: {}
      }

      posts.forEach(function(post){
        data.earnings_this_month += (parseFloat(post.pending_payout_value)+parseFloat(post.total_payout_value));
        data.upvotes_this_month += post.upvotes;
        data.comments_this_month += post.comments
      })

      if(posts.length > 0){
        data.highest_earning_post = posts.reduce(function(l, e) {
          var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
          var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
          return a > b ? e : l;
        });
      }
      
      res.status(200).send(data);
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