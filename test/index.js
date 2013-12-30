
var koa = require('koa')
  , mongoose = require('mongoose')
  , mongooseStore = require('../')
  , route = require('koa-route')
  , request = require('supertest')
  , session = require('koa-session-store')
  , should = require('should');;

var app = koa();

mongoose.connect('mongodb://127.0.0.1/koa_mongoose_store_test');

app.keys = ['some secret key'];
app.use(session({
  store: mongooseStore.create()
}));

var Session = mongoose.model('Session');

var count = 0;

app.use(route.get('/create', function *() {
  count++;
  this.session.count = count;
  this.status = 204;
}));
app.use(route.get('/update', function *() {
  count = this.session.count || 0;
  count++;
  this.session.count = count;
  this.status = 204;
}));
app.use(route.get('/destroy', function *() {
  this.session = null;
  this.status = 204;
}));

var server = app.listen(3005)
  , agent = request.agent(server)
  , sessionId;

describe('koa-session-mongoose', function () {
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
});
