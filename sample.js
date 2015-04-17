// After starting this example load http://localhost:8080 and hit refresh, you will notice that it loads the response from cache for the first 5 seconds and then reloads the cache

// Load modules

var Catbox = require('catbox');
var Http = require('http');



// Declare internals

var internals = {};


internals.handler = function (req, res) {

    internals.getResponse(function (err, item) {

        if (err) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(item);
        }
    });
};


internals.getResponse = function (callback) {

    var key = {
        segment: 'example',
        id: 'myExample'
    };

    var cacheValue = 'my example';
    var ttl = 10000;                         // How long item will be cached in milliseconds

    internals.client.get(key, function (err, cached) {

        if (err) {
            return callback(err);
        }
        else if (cached) {
            return callback(null, 'From cache: ' + cached.item);
        }
        else {
            internals.client.set(key, cacheValue, ttl, function (error) {

                callback(error, cacheValue);
            });
        }
    });
};


internals.startCache = function (callback) {

    var options = {
        partition: 'catbox-examples',
        host: process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost',
        port: process.env.REDIS_PORT_6379_TCP_PORT || '6379',
        password: ''
    };

    internals.client = new Catbox.Client(require('catbox-redis'), options);    // Chance require('../') to 'catbox-redis' when running in your project
    internals.client.start(callback);
};


internals.startServer = function (err) {

    if (err) {
        console.log(err);
        console.log('Could not connect to redis. Ending process.')
        process.exit();
    } else {
        var server = Http.createServer(internals.handler);
        server.listen(3005);
        console.log('Server started at http://localhost:8080/');
    }
};


internals.startCache(internals.startServer);