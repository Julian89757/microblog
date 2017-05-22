var settings = require('../settings');

var Db  = require('mongodb').Db;
var Server = require('mongodb').Server;

module.exports = new Db(settings.dataBaseName,new Server(settings.host,"27017",{}));

