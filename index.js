// Global variables
// WARNING: Use with discretion
global.__basePath = process.cwd();

// All require variables
var Hapi = require('hapi'),
  cRedis = require('catbox-redis'),
  // routes = require(__basePath+'/routes'),
  Cache  = require(__basePath+'/cache');

// Temporary - should be cleaned
var Boom    = require('boom'),
  mongoose  = require('mongoose'),
  addr      = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost',
  port      = process.env.MONGO_PORT_27017_TCP_PORT || 27017;
var Schema  = mongoose.Schema;

mongoose.connect('mongodb://'+addr+':'+port+'/hapicaching');
var testingSchema = new Schema({name: String});
var Testing = mongoose.model('testing', testingSchema);

// Variable declarations and initialization
var redisHost = process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost';
server = new Hapi.Server({
  cache: {
    name      : 'redis',
    engine    : require('catbox-redis'),
    host      : redisHost,
    partition : 'hapiCaching'
  }
});

server.connection({port:3005});
var Find = function (params, next) {
  Testing.find().exec(function (err, result) {
    if (result.length > 0) {
      data = {
        count : result.length,
        data  : result
      };
      return next(null, data);
    }
  });
};

// server.method('find', Find, {cache: {cache: 'redis', expiresIn: 5*1000}});
server.method([
  {
    name: 'find',
    method: Find,
    options: {
      cache: {
        cache     : 'redis',
        expiresIn : 20 * 1000
      },
      generateKey: function (para) {
        return para.model;
      }
    }
  }
]);

server.route([
  {
    method  : 'GET',
    path    : '/',
    handler : function (req, res) {
      res('Yow');
    }
  },
  {
    method  : '*',
    path    : '/something',
    handler : function (req, res) {
      var random = 'Testing' + Math.floor(Math.random() * 100);
      Testing.create({name: random}, function (err, response) {
        res(err, response);
      });
    }
  },
  {
    method  : '*',
    path    : '/{model}/list',
    handler : function (req, res) {
      server.methods.find(req.params, function (err ,result, cache, report) {
        if (cache) console.log('cache ok');
        console.log(report);
        return res(result);
      });
    }
  }
]);

// server.route(routes);

server.start(function (err) {
  if (err) console.log(err);
  console.log('Server running at:', server.info.uri);
});