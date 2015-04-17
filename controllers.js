var Boom    = require('boom'),
  mongoose  = require('mongoose'),
  addr      = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost',
  port      = process.env.MONGO_PORT_27017_TCP_PORT || 27017;

var Schema = mongoose.Schema;

mongoose.connect('mongodb://'+addr+':'+port+'/hapicaching');
var testingSchema = new Schema({name: String});
var Testing = mongoose.model('testing', testingSchema);

module.exports = {
  index: function (req, res) {
    res('Yow');
  },

  something: function (req, res) {
    var random = 'Testing' + Math.floor(Math.random() * 100);
    Testing.create({name: random}, function (err, response) {
      res(err, response);
    });
  },

  getAll: function (req, res) {
    Testing.find().exec(function (err, result) {
      if (result.length > 0) {
        var data = {
          count : result.length,
          data  : result
        };
        res(err, data);
      }
    });
  },
};