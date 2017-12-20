'use strict';

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const supertest = require('supertest');

const koaApp = require('../helpers/koa-app');
const mongooseConnection = require('../helpers/mongoose-connection');

const { expect } = chai;

chai.use(dirtyChai);

describe('integration', () => {
  let app;
  let dbConnection;
  let request;
  let server;
  let Session;
  let sessionId;

  before(async () => {
    dbConnection = await mongooseConnection();
    app = koaApp();
    server = app.listen();
    request = supertest.agent(server);
    Session = dbConnection.model('Session');
  });

  after(async () => {
    await dbConnection.db.dropDatabase();
    dbConnection.close();
    server.close();
  });

  describe('happy path', () => {
    it('should create a session', async () => {
      const response = await request
        .post('/sessions')
        .type('form')
        .send({ foo: 'bar' })
        .expect(201);

      [ , sessionId ] = response.headers['set-cookie'][0].match(/koa:sess=(.*?);/);
      const session = await Session.findById(sessionId);

      expect(session).to.exist();
      expect(session.data.foo).to.equal('bar');
    });

    it('should update a session', async () => {
      await request
        .put(`/sessions/${sessionId}`)
        .send({ foo: 'baz' })
        .expect(200);

      const session = await Session.findById(sessionId);

      expect(session).to.exist();
      expect(session.data.foo).to.equal('baz');
    });

    it('should remove a session', async () => {
      await request
        .delete(`/sessions/${sessionId}`)
        .expect(204);

      const session = await Session.findById(sessionId);

      expect(session).to.not.exist();
    });
  });

  describe('missing session', () => {
    it('should create a session', async () => {
      const response = await request
        .post('/sessions')
        .type('form')
        .send({ foo: 'bar' })
        .expect(201);

      [ , sessionId ] = response.headers['set-cookie'][0].match(/koa:sess=(.*?);/);
      const session = await Session.findById(sessionId);

      expect(session).to.exist();
      expect(session.data.foo).to.equal('bar');
    });

    it('should create a new session when previous session is not found', async () => {
      const oldSessionId = sessionId;
      await Session.remove({ _id: oldSessionId });

      const response = await request
        .put(`/sessions/${sessionId}`)
        .send({ foo: 'baz' })
        .expect(200);

      [ , sessionId ] = response.headers['set-cookie'][0].match(/koa:sess=(.*?);/);
      const session = await Session.findById(sessionId);

      expect(sessionId).to.not.equal(oldSessionId);
      expect(session).to.exist();
      expect(session.data.foo).to.equal('baz');
    });

    it('should remove a session', async () => {
      await request
        .delete(`/sessions/${sessionId}`)
        .expect(204);

      const session = await Session.findById(sessionId);

      expect(session).to.not.exist();
    });
  });
});
