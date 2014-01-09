/**
 * Module dependencies
 */
var mongoose = require('mongoose')
  , Promise = require('bluebird')
  , Schema = mongoose.Schema;

/**
 * @constructor
 */
var MongooseStore = function (Session) {
  this._findOne = Promise.promisify(Session.findOne, Session);
  this._findOneAndUpdate = Promise.promisify(Session.findOneAndUpdate, Session);
  this._remove = Promise.promisify(Session.remove, Session);
}

/**
 * Load data
 */

// for koa-sess
MongooseStore.prototype.get = function *(sid, parse) {
  try {
    var data = yield this._findOne({ sid: sid });
    if (data && data.sid) {
      if (parse === false) return data.blob;
      return JSON.parse(data.blob);
    } else {
      return null;
    }
  } catch (err) {
    console.error(err.stack);
    return null;
  }
}

// for koa-session-store
MongooseStore.prototype.load = function *(sid) {
  return yield this.get(sid, false);
}

/**
 * Save data
 */

// for koa-sess
MongooseStore.prototype.set = function *(sid, blob) {
  try {
    if (typeof blob === 'object') blob = JSON.stringify(blob);
    var data = {
      sid: sid,
      blob: blob,
      updatedAt: new Date()
    }
    yield this._findOneAndUpdate({ sid: sid }, data, { upsert: true, safe: true });
  } catch (err) {
    console.error(err.stack);
  }
}

// for koa-session-store
MongooseStore.prototype.save = function *(sid, blob) {
  yield this.set(sid, blob);
}

/**
 * Remove data
 */

// for koa-sess
MongooseStore.prototype.destroy = function *(sid) {
  try {
    yield this._remove({ sid: sid });
  } catch (err) {
    console.error(err.stack);
  }
}

// for koa-session-store
MongooseStore.prototype.remove = function *(sid) {
  yield this.destroy(sid);
}

/**
 * Create a Mongoose store
 */
exports.create = function (options) {
  options = options || {};
  options.expires = options.expires || 60 * 60 * 24 * 14; // 2 weeks
  options.collection = options.collection || 'sessions';
  options.model = options.model || 'SessionStore';

  var SessionSchema = new Schema({
    sid: String,
    blob: String,
    updatedAt: {
      type: Date,
      default: new Date(),
      expires: options.expires
    }
  });
  var Session = mongoose.model(options.model, SessionSchema, options.collection);

  return new MongooseStore(Session);
}
