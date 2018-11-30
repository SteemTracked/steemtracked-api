// Only require dotenv config if in development mode
if(process.env.NODE_ENV !== "production") require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
global.__root   = __dirname + '/'; 

var app = express();
var router = express.Router();
//set our port to either a predetermined port number if you have set 
//it up, or 3001
var port = process.env.PORT || 3001;

//now we should configure the API to use bodyParser and look for 
//JSON data in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//To prevent errors from Cross Origin Resource Sharing, we will set 
//our headers to allow CORS with middleware like so:
app.use(function(req, res, next) {
  var allowedOrigins = [process.env.APP_URL];
  if(process.env.NODE_ENV !== "production") allowedOrigins.push("http://localhost:3000");
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
 //and remove cacheing so we get the most recent posts
  res.setHeader('Cache-Control', 'no-cache');
  return next();
});

// CONTROLLERS
var AuthController = require(__root + 'controllers/AuthController');
router.use('/auth', AuthController);

var HomeController = require(__root + 'controllers/HomeController');
router.use('/home', HomeController);

var StatsController = require(__root + 'controllers/StatsController');
router.use('/stats', StatsController);

var PostsController = require(__root + 'controllers/PostsController');
router.use('/posts', PostsController);

var FollowersController = require(__root + 'controllers/FollowersController');
router.use('/followers', FollowersController);

var FollowingController = require(__root + 'controllers/FollowingController');
router.use('/following', FollowingController);

var ProjectionsController = require(__root + 'controllers/ProjectionsController');
router.use('/projections', ProjectionsController);

var ExportController = require(__root + 'controllers/ExportController');
router.use('/export', ExportController);

var BidbotsController = require(__root + 'controllers/BidbotsController');
router.use('/bidbots', BidbotsController);

var CurationsController = require(__root + 'controllers/CurationsController');
router.use('/curations', CurationsController);


if(process.env.NODE_ENV === "production"){
// Use our router configuration when we call /
  app.use('/', router);
}else{
  // Use our router configuration when we call /api
  app.use('/api', router);
}


//starts the server and listens for requests
app.listen(port, function() {
  console.log(`api running on port ${port}`);
 });
