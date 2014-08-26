
var mongoose = require('mongoose');

var uri = process.env.URI || 'mongodb://127.0.0.1/koa_mongoose_store_test'
  , uri2 = process.env.URI2 || uri + '_alt';

// create default connection
mongoose.connect(uri);

// test with different session libraries
require('./session-store')('koa-session-store', 'KoaSessionStore');
require('./session-store')('koa-generic-session', 'KoaGenericSession');

// test with secondary mongoose connection
require('./session-store')('koa-generic-session', 'KoaGenericSession', mongoose.createConnection(uri2));
