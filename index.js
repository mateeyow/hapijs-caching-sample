// Global variables
// WARNING: Use with discretion
global.__basePath = process.cwd();

// All require variables
var Hapi = require('hapi'),
  routes = require(__basePath+'/routes'),
  cRedis = require('catbox-redis');

// Variable declarations and initialization
var redisHost = process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost';
var server = new Hapi.Server({
  cache: [{
    name      : 'redis',
    engine    : cRedis,
    host      : redisHost,
    partition : 'hapiCaching'
  }]
});

server.connection({port:3005});

server.route(routes);

server.start(function () {
  console.log('Server running at:', server.info.uri);
});