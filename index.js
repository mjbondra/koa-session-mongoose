/**
 * Module dependencies
 */
var mongoose = require('mongoose');

/**
 * @constructor
 */
var MongooseStore = function (Session) {
  this.Session = Session;
};

/**
 * Load data
 */

// for koa-generic-session
MongooseStore.prototype.get = function *(sid, parse) {
  try {
    var data = yield this.Session.findOne({ sid: sid }).exec();
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
};

// for koa-session-store
MongooseStore.prototype.load = function *(sid) {
  return yield this.get(sid, false);
};

/**
 * Save data
 */
MongooseStore.prototype.set = MongooseStore.prototype.save = function *(sid, blob) {
  try {
    if (typeof blob === 'object') blob = JSON.stringify(blob);
    var data = {
      sid: sid,
      blob: blob,
      updatedAt: new Date()
    };
    yield this.Session.findOneAndUpdate({ sid: sid }, data, { upsert: true, safe: true }).exec();
  } catch (err) {
    console.error(err.stack);
  }
};

/**
 * Remove data
 */
MongooseStore.prototype.destroy = MongooseStore.prototype.remove = function *(sid) {
  try {
    yield this.Session.remove({ sid: sid });
  } catch (err) {
    console.error(err.stack);
  }
};

/**
 * Create a Mongoose store
 */
exports.create = function (options) {
  options = options || {};
  options.collection = options.collection || 'sessions';
  options.connection = options.connection || mongoose;
  options.expires = options.expires || 60 * 60 * 24 * 14; // 2 weeks
  options.model = options.model || 'SessionStore';

  var Schema = options.connection.Schema || mongoose.Schema;
  var SessionSchema = new Schema({
    sid: {
      type: String,
      index: true
    },
    blob: String,
    updatedAt: {
      type: Date,
      default: new Date(),
      expires: options.expires
    }
  });
  var Session = options.connection.model(options.model, SessionSchema, options.collection);

  return new MongooseStore(Session);
};
