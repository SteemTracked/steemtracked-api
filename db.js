var sql = require("mssql");

var authConnections = []
for(var i = 0; i < 5; i++){
  authConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var homeConnections = []
for(var i = 0; i < 6; i++){
  homeConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var statsConnections = []
for(var i = 0; i < 14; i++){
  statsConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var postsConnections = []
for(var i = 0; i < 3; i++){
  postsConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var followersConnections = []
for(var i = 0; i < 3; i++){
  followersConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var followingConnections = []
for(var i = 0; i < 3; i++){
  followingConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var projectionsConnections = []
for(var i = 0; i < 3; i++){
  projectionsConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var exportConnections = []
for(var i = 0; i < 3; i++){
  exportConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var bidbotsConnections = []
for(var i = 0; i < 3; i++){
  bidbotsConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

var curationsConnections = []
for(var i = 0; i < 3; i++){
  curationsConnections.push(
    new sql.ConnectionPool({
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      server: process.env.DBSERVER, 
      database: process.env.DBNAME,
    })
  )
}

module.exports = {
  authConnections, 
  homeConnections, 
  statsConnections,
  postsConnections,
  followersConnections,
  followingConnections,
  projectionsConnections,
  exportConnections,
  bidbotsConnections,
  curationsConnections
}; 