'use strict';

const mongoose = require('mongoose');
const sessionStore = require('./session-store');
const uri = process.env.URI || 'mongodb://127.0.0.1/koa_mongoose_store_test';
const uri2 = process.env.URI2 || uri + '_alt';

// create default connection
mongoose.connect(uri);

// test with different session libraries
sessionStore('koa-generic-session', 'KoaGenericSession');
sessionStore('koa-session-store', 'KoaSessionStore');


// test with secondary mongoose connection
sessionStore('koa-generic-session', 'KoaGenericSession', mongoose.createConnection(uri2));
sessionStore('koa-session-store', 'KoaSessionStore', mongoose.createConnection(uri2));
