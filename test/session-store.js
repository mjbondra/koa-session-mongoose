'use strict';

module.exports = (sessionLibrary, mongooseModel, connection) => {
  const app = require('koa')();
  const MongooseStore = require('../');
  const route = require('koa-route');
  const request = require('supertest');
  const session = require(sessionLibrary);
  const should = require('should');

  const mongooseOptions = { model: mongooseModel };

  if (connection) mongooseOptions.connection = connection;
  else connection = require('mongoose');

  app.keys = ['some secret key'];
  app.use(session({
    store: new MongooseStore(mongooseOptions)
  }));

  let count = 0;


  app.use(route.get('/create', function* () {
    this.session.count = count;
    this.session.count++;
    this.status = 204;
  }));


  app.use(route.get('/read', function* () {
    this.status = 204;
  }));


  app.use(route.get('/update', function* () {
    this.session.count++;
    this.status = 204;
  }));


  app.use(route.get('/destroy', function* () {
    this.session = null;
    this.status = 204;
  }));


  const server = app.listen();
  const agent = request.agent(server);
  const Session = connection.model(mongooseModel);
  let sessionId;


  describe(`koa-session-mongoose for ${sessionLibrary} using database ${connection.name || connection.connections[0].name}`, () => {
    before(done => Session.remove({}, () => done()));
    after(done => Session.remove({}, () => done()));


    describe('Initial state', () => {
      it('Should not have any session documents', done => Session
        .findOne({}, (err, session) => {
          should.equal(session, null);
          done();
        })
      );
    });


    describe('Create', () => {
      it('Should 204', done => agent
        .get('/create')
        .expect(204, done)
      );

      it('Should create session document (count value should be 1)', done => Session
        .findOne({}, (err, session) => {
          sessionId = session.id || null;
          JSON.parse(session.blob).count.should.equal(1);
          done();
        })
      );
    });


    describe('Read', () => {
      it('Should 204', done => agent
        .get('/read')
        .expect(204, done)
      );

      it('Should not change session document (count value should be 1)', done => Session
        .findOne({ _id: sessionId }, (err, session) => {
          JSON.parse(session.blob).count.should.equal(1);
          done();
        })
      );
    });


    describe('Update', () => {
      it('Should 204', done => agent
        .get('/update')
        .expect(204, done)
      );

      it('Should update session document (count value should be 2)', done => Session
        .findOne({ _id: sessionId }, (err, session) => {
          JSON.parse(session.blob).count.should.equal(2);
          done();
        })
      );
    });


    describe('Destroy', () => {
      it('Should 204', done => agent
        .get('/destroy')
        .expect(204, done)
      );

      it('Should delete session document', done => Session
        .findOne({ _id: sessionId }, (err, session) => {
          should.equal(session, null);
          done();
        })
      );
    });


    describe('Read', () => {
      it('Should 204', done => agent
        .get('/read')
        .expect(204, done)
      );

      it('Should not find a session document', done => Session
        .findOne({}, (err, session) => {
          should.equal(session, null);
          done();
        })
      );
    });
  });
};
