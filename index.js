// Global variables
// WARNING: Use with discretion
global.__basePath = process.cwd();

// All require variables
var Hapi = require('hapi'),
  cRedis = require('catbox-redis'),
  // routes = require(__basePath+'/routes'),
  Cache  = require(__basePath+'/cache'),
  colors = require('colors');

// Temporary - should be cleaned
var Boom    = require('boom'),
  mongoose  = require('mongoose'),
  addr      = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost',
  port      = process.env.MONGO_PORT_27017_TCP_PORT || 27017;
var redisHost = process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost';
var Schema  = mongoose.Schema;

var ErrorReply = function (err) {
  this.error = err
  return Boom.create(this.error.status, this.error.reason);
}
// Variable declarations and initialization
server = new Hapi.Server();

server.connection({port:3005});

server.register({
  register: require('dogwater'),
  options: {
    connections: {
      'mongoConn': {
        adapter: 'mongoConn',
        host: addr,
        database: 'dogwaterOrm'
      }
    },
    adapters: {
      mongoConn: 'sails-mongo'
    },
    models: [
      {
        identity: 'user',
        schema: true,
        migrate: 'safe',
        connection: 'mongoConn',
        attributes: {
          firstName: 'string',
          lastName: 'string',
          age: {
            type: 'integer',
            required: true
          },
          status: 'boolean',
          company: {
            model: 'company'
          }
        }
      },
      {
        identity: 'company',
        schema: true,
        migrate: 'safe',
        connection: 'mongoConn',
        attributes: {
          users: {
            collection: 'user',
            via: 'company'
          },
          name: 'string'
        }
      }
    ]
  }
}, function (err) {
  if (err) console.log(colors.red.bold('Failed to load dogwater: ', err))
});

server.route([
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      var User = request.model.user
      User.find().exec(function (err, user) {
        reply(err, user);
      });
    }
  },
  {
    method: 'GET',
    path: '/create',
    handler: function (request, reply) {
      var User = request.model.user
      var data = {
        firstName: 'Joe',
        lastName: 'Manyakols',
        age: 26,
        sex: 'male',
        company: '1'
      }
      User.create(data).exec(function (err, user) {
        if (err) {
          reply(new ErrorReply(err))
        } else {
          reply(user);
        }
      })
    }
  },
  {
    method: 'GET',
    path: '/company/create',
    handler: function (request, reply) {
      var Company = request.model.company
      var data = {
        name: 'Meditab'
      }
      Company.create(data)
      .exec(function (err, company) {
        if (err) reply(new ErrorReply(err));
        if (company) reply(company);
      });
    }
  },
  {
    method: 'GET',
    path: '/company/list',
    handler: function (request, reply) {
      var Company = request.model.company
      var yow = Company.find()
      hey = true
      if (hey) {
        sass = yow.populate('users')
      }
      sass.exec(function (err, company) {
        if (err) reply(new ErrorReply(err));
        if (company) reply(company);
      });
    }
  },
  {
    method: 'GET',
    path: '/delete',
    handler: function (request, reply) {
      var User = request.model.user
      User.destroy({age: 26}).exec(function (err, user) {
        if (err) {
          reply (err);
        } else {
          reply(user);
        }
      })
    }
  },
  {
    method: 'GET',
    path: '/one',
    handler: function (request, reply) {
      var User = request.model.user
      User.findOne({firstName: 'Joe'})
      .populate('company')
      .exec(function (err, user) {
        console.log(err, user);
        if (err) {
          reply(new ErrorReply(err));
        } else {
          reply(user);
        }
      });
    }
  }
])

server.start(function (err) {
  if (err) console.log(err);
  console.log(colors.green.bold('Server running at:', server.info.uri));
});