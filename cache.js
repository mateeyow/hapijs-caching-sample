var Cache = function () {
  this.server  = null;
  this.options = null;
};

Cache.prototype.setServer = function (server) {
  if (this.server === null) {
    this.server = server;
  }
};

Cache.prototype.getServer = function () {
  return this.server
};

module.exports = new Cache();