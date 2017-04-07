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


  async destroy (sid) {
    await this.Session.remove({ sid: sid });
  }


  async get (sid, parse) {
    const data = await this.Session.findOne({ sid: sid });

    if (!data || !data.sid) return null;
    if (parse === false) return data.blob;

    return JSON.parse(data.blob);
  }


  async load (sid) {
    return await this.get(sid, false);
  }


  async remove (sid) {
    return await this.destroy(sid);
  }


  async save (sid, blob) {
    return await this.set(sid, blob);
  }


  async set (sid, blob) {
    const data = {
      sid: sid,
      blob: typeof blob === 'object' ? JSON.stringify(blob) : blob,
      updatedAt: new Date()
    };

    await this.Session.findOneAndUpdate({ sid: sid }, data, { upsert: true, safe: true });
  }


  static create (options) {
    return new MongooseStore(options);
  }
}


module.exports = MongooseStore;
