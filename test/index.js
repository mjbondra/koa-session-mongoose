
var mongoose = require('mongoose');

var uri = process.env.URI || 'mongodb://127.0.0.1/koa_mongoose_store_test';
mongoose.connect(uri);

require('./koa-sess');
require('./koa-session-store');
