var express = require('express');
var router = express.Router();
var sql = require('mssql');
var connection = require("../db").statsConnections; 
var chooseConnection = require("../dbHelpers");

// Get Stats
router.get('/:username', function(req, res){
  var sC = chooseConnection(connection, 0, 2);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        SELECT 
          "total_payout_value", "pending_payout_value", "created", "net_votes", "children", "permlink"
        FROM
          Comments (NOLOCK)
        WHERE 
          "author" = @username AND
          depth = 0 AND
          "title" != ''
        ORDER BY "created" DESC
      `
    ).then(function (result) {
      // Months
      var monthStrings = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      // Date Months
      var dateMonths = {
        thisMonth: new Date(),
        lastMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        prevMonth: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        prevMonth1: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        prevMonth2: new Date(new Date().setMonth(new Date().getMonth() - 4)),
        prevMonth3: new Date(new Date().setMonth(new Date().getMonth() - 5)),
      }

      // Records
      var records = result.recordsets[0];

      // Data Template
      var data = {
        total_upvotes: 0,
        total_earnings: 0,
        total_comments: 0,
        highest_upvoted: '',
        highest_earned: '',
        most_commented: '',
        thisMonth: {
          monthYear: '',
          posts_count: 0,
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0,
          highest_earned: '',
        },
        lastMonth: {
          monthYear: '',
          posts_count: 0,
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0,
          highest_earned: '',
        },
        prevMonth: {
          monthYear: '',
          posts_count: 0,
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0,
          highest_earned: '',
        },
        prevMonth1: {
          monthYear: '',
          posts_count: 0,
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0,
          highest_earned: '',
        },
        prevMonth2: {
          monthYear: '',
          posts_count: 0,
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0,
          highest_earned: '',
        },
        prevMonth3: {
          monthYear: '',
          posts_count: 0,
          comments_count: 0,
          upvotes_count: 0,
          earnings_count: 0,
          highest_earned: '',
        },
        retrievedData: true,
      }

      // Highest Upvoted Post
      data.highest_upvoted = records.length > 0 ? (records.reduce(function(l, e) {
        return e.net_votes > l.net_votes ? e : l;
      })).permlink : "";

      // Highest Earning Post
      data.highest_earned = records.length > 0 ? (records.reduce(function(l, e) {
        var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
        var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
        return a > b ? e : l;
      })).permlink : "";

      // Most Commented Post
      data.most_commented = records.length > 0 ? (records.reduce(function(l, e) {
        return e.children > l.children ? e : l;
      })).permlink : "";

      // Month Data
      var monthData = {
        thisMonth: [],
        lastMonth: [],
        prevMonth: [],
        prevMonth1: [],
        prevMonth2: [],
        prevMonth3: [],
      }

      // Months
      var months = ["thisMonth", "lastMonth", "prevMonth", "prevMonth1", "prevMonth2", "prevMonth3"];

      // Total Upvotes And Earnings, Set Posts To Months
      for(var i = 0; i < records.length; i++){
        // Upvotes, Earnings and Comments
        data.total_upvotes += records[i].net_votes;
        data.total_comments += records[i].children;
        data.total_earnings += (parseFloat(records[i].total_payout_value)+parseFloat(records[i].pending_payout_value));
        
        // Month Data
        for(var ii = 0; ii < months.length; ii++){
          if(new Date(records[i].created).getMonth() === dateMonths[months[ii]].getMonth() && new Date(records[i].created).getFullYear() === dateMonths[months[ii]].getFullYear()){
            data[months[ii]].posts_count++;
            data[months[ii]].comments_count += records[i].children;
            data[months[ii]].upvotes_count += records[i].net_votes;
            data[months[ii]].earnings_count += (parseFloat(records[i].total_payout_value)+parseFloat(records[i].pending_payout_value));
            monthData[months[ii]].push(records[i]);
          }
          // Month Year
          data[months[ii]].monthYear = monthStrings[dateMonths[months[ii]].getMonth()] + " " + dateMonths[months[ii]].getFullYear()
        }
      }

     // Highest Upvoted Post This Month
     data.thisMonth.highest_earned = monthData.thisMonth.length > 0 ? (monthData.thisMonth.reduce(function(l, e) {
        var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
        var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
        return a > b ? e : l;
      })).permlink : ''

      // Highest Upvoted Post Last Month
      data.lastMonth.highest_earned = monthData.lastMonth.length > 0 ? (monthData.lastMonth.reduce(function(l, e) {
        var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
        var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
        return a > b ? e : l;
      })).permlink : ''

      // Highest Upvoted Post Prev Month
      data.prevMonth.highest_earned = monthData.prevMonth.length > 0 ? (monthData.prevMonth.reduce(function(l, e) {
        var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
        var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
        return a > b ? e : l;
      })).permlink : ''

      // Highest Upvoted Post Prev1 Month
      data.prevMonth1.highest_earned = monthData.prevMonth1.length > 0 ? (monthData.prevMonth1.reduce(function(l, e) {
        var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
        var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
        return a > b ? e : l;
      })).permlink : ''

      // Highest Upvoted Post Prev2 Month
      data.prevMonth2.highest_earned = monthData.prevMonth2.length > 0 ? (monthData.prevMonth2.reduce(function(l, e) {
        var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
        var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
        return a > b ? e : l;
      })).permlink : ''

      // Highest Upvoted Post Prev3 Month
      data.prevMonth3.highest_earned = monthData.prevMonth3.length > 0 ? (monthData.prevMonth3.reduce(function(l, e) {
        var a = (parseFloat(e.total_payout_value)+parseFloat(e.pending_payout_value))
        var b = (parseFloat(l.total_payout_value)+parseFloat(l.pending_payout_value))
        return a > b ? e : l;
      })).permlink : ''

      res.send(data)

      connection[sC].close();
    }).catch(function (err) {
      console.log(err);
      connection[sC].close();
    });
  }).catch(function (err) {
      console.log(err);
  });
})

// Get DTUBE
router.get('/dtube/:username', function(req,res){
  var sC = chooseConnection(connection, 2, 4);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        SELECT
           "total_payout_value", "pending_payout_value", "created", "net_votes"
        FROM 
          Comments (NOLOCK)
        WHERE 
          "author" = @username AND
          "depth" = 0 AND
          CONTAINS("json_metadata", ':dtube/') order by "created" DESC
      `
    ).then(function (result) {
      var dtube = result.recordsets[0];

      var dtubeData = {
        posts_count: dtube.length,
        upvotes_count: 0,
        earnings_count: 0
      } 

      for(var i = 0; i < dtube.length; i++){
        dtubeData.upvotes_count += dtube[i].net_votes;
        dtubeData.earnings_count += (parseFloat(dtube[i].total_payout_value)+parseFloat(dtube[i].pending_payout_value));
      }

      res.status(200).send(dtubeData);
      connection[sC].close();
    }).catch(function(err){
      console.log(err);
      connection[sC].close();
    })
  }).catch(function(err) {
    console.log(err);
  })
})

// Get PARTIKO
router.get('/partiko/:username', function(req,res){
  var sC = chooseConnection(connection, 4, 6);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        SELECT
           "total_payout_value", "pending_payout_value", "created", "net_votes"
        FROM 
          Comments (NOLOCK)
        WHERE 
          "author" = @username AND
          "depth" = 0 AND
          "parent_permlink" = 'partiko' order by "created" DESC
      `
    ).then(function (result) {
      var partiko = result.recordsets[0];

      var partikoData = {
        posts_count: partiko.length,
        upvotes_count: 0,
        earnings_count: 0
      } 

      for(var i = 0; i < partiko.length; i++){
        partikoData.upvotes_count += partiko[i].net_votes;
        partikoData.earnings_count += (parseFloat(partiko[i].total_payout_value)+parseFloat(partiko[i].pending_payout_value));
      }

      res.status(200).send(partikoData);
      connection[sC].close();
    }).catch(function(err){
      console.log(err);
      connection[sC].close();
    })
  }).catch(function(err) {
    console.log(err);
  })
})

// Get UTOPIAN IO
router.get('/utopianio/:username', function(req,res){
  var sC = chooseConnection(connection, 6, 8);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        SELECT
           "total_payout_value", "pending_payout_value", "created", "net_votes"
        FROM 
          Comments (NOLOCK)
        WHERE 
          "author" = @username AND
          "depth" = 0 AND
          "parent_permlink" = 'utopian-io' order by "created" DESC
      `
    ).then(function (result) {
      var utopianIo = result.recordsets[0];

      var utopianIoData = {
        posts_count: utopianIo.length,
        upvotes_count: 0,
        earnings_count: 0
      } 

      for(var i = 0; i < utopianIo.length; i++){
        utopianIoData.upvotes_count += utopianIo[i].net_votes;
        utopianIoData.earnings_count += (parseFloat(utopianIo[i].total_payout_value)+parseFloat(utopianIo[i].pending_payout_value));
      }

      res.status(200).send(utopianIoData);
      connection[sC].close();
    }).catch(function(err){
      console.log(err);
      connection[sC].close();
    })
  }).catch(function(err) {
    console.log(err);
  })
})

// Get STEEMHUNT
router.get('/steemhunt/:username', function(req,res){
  var sC = chooseConnection(connection, 8, 10);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input("username", req.params.username);
    request.query(`
        SELECT
           "total_payout_value", "pending_payout_value", "created", "net_votes"
        FROM 
          Comments (NOLOCK)
        WHERE 
          "author" = @username AND
          "depth" = 0 AND
          "parent_permlink" = 'steemhunt' order by "created" DESC
      `
    ).then(function (result) {
      var steemhunt = result.recordsets[0];

      var steemhuntData = {
        posts_count: steemhunt.length,
        upvotes_count: 0,
        earnings_count: 0
      } 

      for(var i = 0; i < steemhunt.length; i++){
        steemhuntData.upvotes_count += steemhunt[i].net_votes;
        steemhuntData.earnings_count += (parseFloat(steemhunt[i].total_payout_value)+parseFloat(steemhunt[i].pending_payout_value));
      }

      res.status(200).send(steemhuntData);
      connection[sC].close();
    }).catch(function(err){
      console.log(err);
      connection[sC].close();
    })
  }).catch(function(err) {
    console.log(err);
  })
})

// Get Total Curations 
router.get('/curations/:username', function(req,res){
  var sC = chooseConnection(connection, 10, connection.length);
  connection[sC].connect().then(function () {
    var request = new sql.Request(connection[sC]);
    request.input('username', req.params.username);
    request.query(`
          SELECT
            "reward"
          FROM 
            VOCurationRewards (NOLOCK)
          WHERE
            "curator" = @username
      `
    ).then(function (results) {
      var records = results.recordset;
      var amount = 0;
      for(var i = 0; i < records.length; i++) {
        amount += parseFloat(records[i].reward)
      }
      res.status(200).send({total_curations: amount})
      connection[sC].close();
    }).catch(function(err){
      console.log(err);
      connection[sC].close();
    })
  }).catch(function(err) {
    console.log(err);
  })
})


module.exports = router;