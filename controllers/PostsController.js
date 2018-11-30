var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").postsConnections; 
var chooseConnection = require("../dbHelpers");


function getCategories(posts){
  var categoriesData = {}
  
  posts.forEach(post => {
    if(categoriesData.hasOwnProperty(post.category)){
      categoriesData[post.category].category_posts++
      categoriesData[post.category].category_comments += post.children
      categoriesData[post.category].category_upvotes += post.net_votes
      categoriesData[post.category].category_earnings += (parseFloat(post.pending_payout_value)+parseFloat(post.total_payout_value))
    }else{
      categoriesData[post.category] = {
        category_posts: 1,
        category_comments: post.children,
        category_upvotes: post.net_votes,
        category_earnings: (parseFloat(post.pending_payout_value)+parseFloat(post.total_payout_value))
      }
    }
  })

  return categoriesData
} 


// Get Posts
router.get('/:username', function(req,res){
  var sC = chooseConnection(connection, 0, connection.length);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        SELECT 
          "children", "permlink", "id", "created", "category", "title",
          "total_payout_value", "pending_payout_value", "net_votes", "url"
        FROM 
          Comments (NOLOCK)
        WHERE
          "author" = @username AND
          "depth" = 0 AND
          "title" != ''
        ORDER BY 
          "created" DESC
      `
    ).then(function (result) {
      var data = {
        posts: result.recordsets[0],
        categories: getCategories(result.recordsets[0]),
        retrievedData: true
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