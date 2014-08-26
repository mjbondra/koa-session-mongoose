
module.exports = function (sessionLibrary, mongooseModel, connection) {

  var koa = require('koa')
    , mongooseStore = require('../')
    , route = require('koa-route')
    , request = require('supertest')
    , session = require(sessionLibrary)
    , should = require('should');

  var app = koa();

  var mongooseOptions = { model: mongooseModel };
  if (connection) mongooseOptions.connection = connection;
  else connection = require('mongoose');

  app.keys = ['some secret key'];
  app.use(session({
    store: mongooseStore.create(mongooseOptions)
  }));

  var count = 0;

  app.use(route.get('/create', function *() {
    this.session.count = count;
    this.session.count++;
    this.status = 204;
  }));
  app.use(route.get('/read', function *() {
    this.status = 204;
  }));
  app.use(route.get('/update', function *() {
    this.session.count++;
    this.status = 204;
  }));
  app.use(route.get('/destroy', function *() {
    this.session = null;
    this.status = 204;
  }));

  var server = app.listen()
    , agent = request.agent(server)
    , Session = connection.model(mongooseModel)
    , sessionId;

  describe('koa-session-mongoose for ' + sessionLibrary + ' using database ' + ( connection.name || connection.connections[0].name ), function () {
    before(function (done) {
      Session.remove({}, function (err) {
        done();
      });
    });

    describe('Initial state', function () {
      it('Should not have any session documents', function (done) {
        Session.findOne({}, function (err, session) {
          should.equal(session, null);
          done();
        });
      });
    });
    describe('Create', function () {
      it('Should 204', function (done) {
        agent
          .get('/create')
          .expect(204, done);
      });
      it('Should create session document (count value should be 1)', function (done) {
        Session.findOne({}, function (err, session) {
          sessionId = session.id || null;
          JSON.parse(session.blob).count.should.equal(1);
          done();
        });
      });
    });
    describe('Read', function () {
      it('Should 204', function (done) {
        agent
          .get('/read')
          .expect(204, done);
      });
      it('Should not change session document (count value should be 1)', function (done) {
        Session.findOne({ _id: sessionId }, function (err, session) {
          JSON.parse(session.blob).count.should.equal(1);
          done();
        });
      });
    });
    describe('Update', function () {
      it('Should 204', function (done) {
        agent
          .get('/update')
          .expect(204, done);
      });
      it('Should update session document (count value should be 2)', function (done) {
        Session.findOne({ _id: sessionId }, function (err, session) {
          JSON.parse(session.blob).count.should.equal(2);
          done();
        });
      });
    });
    describe('Destroy', function () {
      it('Should 204', function (done) {
        agent
          .get('/destroy')
          .expect(204, done);
      });
      it('Should delete session document', function (done) {
        Session.findOne({ _id: sessionId }, function (err, session) {
          should.equal(session, null);
          done();
        });
      });
    });
    describe('Read', function () {
      it('Should 204', function (done) {
        agent
          .get('/read')
          .expect(204, done);
      });
      it('Should not find a session document', function (done) {
        Session.findOne({}, function (err, session) {
          should.equal(session, null);
          done();
        });
      });
    });
  });
};
