'use strict';

const mongoose = require('mongoose');


class MongooseStore {
  constructor (options) {
    options = options || {};
    options.collection = options.collection || 'sessions';
    options.connection = options.connection || mongoose;
    options.expires = options.expires || 60 * 60 * 24 * 14; // 2 weeks
    options.model = options.model || 'SessionStore';

    const Schema = options.connection.Schema || mongoose.Schema;
    const SessionSchema = new Schema({
      sid: {
        index: true,
        type: String
      },
      blob: String,
      updatedAt: {
        default: new Date(),
        expires: options.expires,
        type: Date
      }
    });

    this.Session = options.connection.model(options.model, SessionSchema, options.collection);
  }


  *destroy (sid) {
    yield this.Session.remove({ sid: sid });
  }


  *get (sid, parse) {
    const data = yield this.Session.findOne({ sid: sid });

    if (!data || !data.sid) return null;
    if (parse === false) return data.blob;

    return JSON.parse(data.blob);
  }


  *load (sid) {
    return yield this.get(sid, false);
  }


  *remove (sid) {
    return yield this.destroy(sid);
  }


  *save (sid, blob) {
    return yield this.set(sid, blob);
  }


  *set (sid, blob) {
    const data = {
      sid: sid,
      blob: typeof blob === 'object' ? JSON.stringify(blob) : blob,
      updatedAt: new Date()
    };

    yield this.Session.findOneAndUpdate({ sid: sid }, data, { upsert: true, safe: true });
  }


  static create (options) {
    return new MongooseStore(options);
  }
}


module.exports = MongooseStore;
