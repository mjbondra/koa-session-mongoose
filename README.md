# koa-session-mongoose

Mongoose storage layer for [koa-session](https://github.com/koajs/session).

## Installation

```shell
npm i --save koa-session-mongoose
```

**OR**

```shell
yarn add koa-session-mongoose
```

## Usage

### Prerequisites

This store requires [node@>=8.3.0](https://nodejs.org), [koa@>=2.0.0](http://koajs.com), and [koa-session@>=5.0.0](https://github.com/koajs/session).

It has a peer-dependency of [mongoose@>=5.0.0](https://mongoosejs.com/).

If you are using older dependencies, consider using [koa-session-mongoose@^1.0.0](https://gitlab.com/wondermonger/koa-session-mongoose/tree/v1.0.0) or [koa-session-mongoose@^2.0.0](https://gitlab.com/wondermonger/koa-session-mongoose/tree/v2.0.0).

### Code Examples

```javascript
const Koa = require("koa");
const mongoose = require("mongoose");
const MongooseStore = require("koa-session-mongoose");
const session = require("koa-session");

// mongoose connection must exist before creating a store with koa-session-mongoose
mongoose.connect("mongodb://some_host/some_db");

const app = new Koa();

// needed for cookie-signing
app.keys = ["some secret key"];

app.use(session({ store: new MongooseStore() }, app));

app.use(async ctx => {
  const { session } = ctx;
  let n = session.views || 0;
  session.views = ++n;
  ctx.body = `${n} view(s)`;
});

app.listen(3000);
```

You can optionally specify collection name (`collection`), model name (`name`), expiration time in seconds (`expires`), and Mongoose connection (`connection`):

```javascript
async function init (uri) => {
  const connection = await mongoose.connect(uri, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  app.use(session({
    store: new MongooseStore({
      collection: 'appSessions',
      connection: connection,
      expires: 86400, // 1 day is the default
      name: 'AppSession'
    })
  }, app));
}

```

## Related Modules

- [koa-session](https://github.com/koajs/session)

## Development

Merge requests should be submitted to [https://gitlab.com/wondermonger/koa-session-mongoose](https://gitlab.com/wondermonger/koa-session-mongoose).

A mirror of the project will persist at [https://github.com/mjbondra/koa-session-mongoose](https://github.com/mjbondra/koa-session-mongoose), but all future development will be directed to the new repository.

### Installation

```shell
npm i
```

### Linting

```shell
npm run lint
```

### Testing

```shell
# all tests
npm run test

# integration tests
npm run test:integration

# unit tests
npm run test:unit
```

If you require a MongoDB URI other than the default (`mongodb://127.0.0.1/koa-session-mongoose`), specify it as follows before executing `npm run test` or `npm run test:integration`:

```shell
MONGODB_URI="mongodb://[username:password@]host[:port]/[database]"
```

## License

The MIT License (MIT)

Copyright (c) 2013-2019 Michael J. Bondra <mjbondra@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
