/**
 * Module dependencies
 */
var mongoose = require('mongoose')
  , Q = require('q')
  , Schema = mongoose.Schema;

/**
 * @constructor
 */
var MongooseStore = function (Session) {
  this._session = Session;
}

/**
 * Load data
 */
MongooseStore.prototype.load = function *(sid) {
  var data = yield Q.ninvoke(this._session, 'findOne', { sid: sid });
  if (data && data.sid) {
    return data.blob;
  } else {
    return null;
  }
}

/**
 * Save data
 */
MongooseStore.prototype.save = function *(sid, blob) {
  var data = {
    sid: sid,
    blob: blob,
    updatedAt: new Date()
  };
  yield Q.ninvoke(this._session, 'findOneAndUpdate', { sid: sid }, data, { upsert: true, safe: true });
}

/**
 * Remove data
 */
MongooseStore.prototype.remove = function *(sid) {
  yield Q.ninvoke(this._session, 'remove', { sid: sid });
}

/**
 * Create a Mongoose store
 */
exports.create = function (options) {
  options = options || {};
  options.expires = options.expires || 60 * 60 * 24 * 14; // 2 weeks
  options.collection = options.collection || 'sessions';

  var SessionSchema = new Schema({
    sid: String,
    blob: String,
    updatedAt: {
      type: Date,
      default: new Date(),
      expires: options.expires
    }
  });
  var Session = mongoose.model('Session', SessionSchema, options.collection);

  return new MongooseStore(Session);
}
