var Controller = require(__basePath+'/controllers');
module.exports = [
  {
    method  : 'GET',
    path    : '/',
    handler : Controller.index
  },
  {
    method  : '*',
    path    : '/something',
    handler : Controller.something
  },
  {
    method  : '*',
    path    : '/all',
    handler : Controller.getAll,
    config  : {
      cache: {
        expiresIn : 5000, // 5 seconds
        privacy   : 'private'
      }
    }
  }
];