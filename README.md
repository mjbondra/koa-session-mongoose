# koa-session-mongoose

[![Build Status](https://img.shields.io/travis/mjbondra/koa-session-mongoose.svg?style=flat)](https://travis-ci.org/mjbondra/koa-session-mongoose) [![NPM version](https://img.shields.io/npm/v/koa-session-mongoose.svg?style=flat)](http://badge.fury.io/js/koa-session-mongoose)

Mongoose storage layer for [koa-session-store](https://github.com/hiddentao/koa-session-store) or [koa-generic-session](https://github.com/koajs/generic-session).  

This can be used instead of [koa-session-mongo](https://github.com/hiddentao/koa-session-mongo) with [koa-session-store](https://github.com/hiddentao/koa-session-store), for a more direct integration with an existing [Mongoose](http://mongoosejs.com) connection.

## Installation

```
npm install koa-session-mongoose
```

## Usage

This store requires either [koa-session-store](https://github.com/hiddentao/koa-session-store) or [koa-generic-session](https://github.com/koajs/generic-session).

```
var session = require('koa-session-store'); // or you can use 'koa-generic-session'
var mongoose = require('mongoose');
var mongooseStore = require('koa-session-mongoose');
var koa = require('koa');

// mongoose connection must exist before creating a store with koa-session-mongoose
mongoose.connect('mongodb://some_host/some_db');

var app = koa();

app.keys = ['some secret key'];  // needed for cookie-signing

app.use(session({
  store: mongooseStore.create()
}));

app.use(function *() {
  var n = this.session.views || 0;
  this.session.views = ++n;
  this.body = n + ' views';
});

app.listen(3000);
console.log('listening on port 3000');
```

You can optionally specify model name, collection name, expiration time (in seconds), and Mongoose connection:

```
var mongooseConnection = mongoose.createConnection('mongodb://some_host/some_db');

app.use(session({
  store: mongooseStore.create({
    collection: 'koaSessions',
    connection: mongooseConnection,
    expires: 60 * 60 * 24 * 14, // 2 weeks is the default
    model: 'KoaSession'
  })
}));

```

## Other Relevant Modules

* [koa-generic-session](https://github.com/koajs/generic-session)
* [koa-session-store](https://github.com/hiddentao/koa-session-store)  
* [koa-session-mongo](https://github.com/hiddentao/koa-session-mongo)

## Tests

From root directory:

```
npm install
npm test
```

If you require a specific MongoDB URI, specify it as follows before `npm test`:

```
export URI="mongodb://[username:password@]host[:port]/[database]"
export URI2="mongodb://[username:password@]host[:port]/[database2]"
```

Otherwise, the following URIs will be used:

```
mongodb://127.0.0.1/koa_mongoose_store_test
mongodb://127.0.0.1/koa_mongoose_store_test_alt
```

## License

The MIT License (MIT)

Copyright (c) 2013-2015 Michael J. Bondra < [mjbondra@gmail.com](mailto:mjbondra@gmail.com) >

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
