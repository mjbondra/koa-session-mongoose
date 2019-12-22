"use strict";

const chai = require("chai");
const dirtyChai = require("dirty-chai");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

const { expect } = chai;

chai.use(dirtyChai);
chai.use(sinonChai);

describe("MongooseStore", () => {
  let model;
  let mongoose;
  let MongooseStore;
  let schema;
  let session;

  beforeEach(() => {
    session = { data: { foo: "bar" } };
    model = {
      deleteOne: sinon.spy(async () => session),
      findById: sinon.spy(async () => session),
      findByIdAndUpdate: sinon.spy(async () => session)
    };
    mongoose = {
      model: sinon.spy(() => model),
      Schema: sinon.spy(() => schema)
    };
    schema = { _id: String, data: Object, updatedAt: { expires: 86400 } };
    MongooseStore = proxyquire("../../lib", { mongoose, "./schema": schema });
  });

  describe("constructor", () => {
    let options;

    beforeEach(() => {
      options = {
        collection: "sessions",
        connection: mongoose,
        expires: 86400, // 1 day
        name: "Session"
      };
    });

    it("should return a session store with destroy, get, and set methods", () => {
      const store = new MongooseStore();
      expect(store.destroy).to.be.a("function");
      expect(store.get).to.be.a("function");
      expect(store.set).to.be.a("function");
    });

    it("should call mongoose.model", () => {
      const expectedArgs = [options.name, schema, options.collection];
      const store = new MongooseStore();
      expect(mongoose.model).to.have.been.calledWith(...expectedArgs);
      expect(store.session).to.equal(model);
    });

    it("should call mongoose.Schema", () => {
      const store = new MongooseStore();
      expect(mongoose.Schema).to.have.been.calledWith(schema);
      expect(store.session).to.equal(model);
    });

    it("should use a custom collection name when options.collection is set", () => {
      const collection = "foos";
      const expectedArgs = [options.name, schema, collection];
      const store = new MongooseStore({ collection });
      expect(mongoose.model).to.have.been.calledWith(...expectedArgs);
      expect(store.session).to.equal(model);
    });

    it("should use a custom mongoose connection when options.connection is set", () => {
      const connection = {
        model: sinon.spy(() => model),
        Schema: sinon.spy(() => schema)
      };
      const expectedArgs = [options.name, schema, options.collection];
      const store = new MongooseStore({ connection });
      expect(connection.Schema).to.have.been.calledWith(schema);
      expect(connection.model).to.have.been.calledWith(...expectedArgs);
      expect(mongoose.Schema).to.not.have.been.called();
      expect(mongoose.model).to.not.have.been.called();
      expect(store.session).to.equal(model);
    });

    it("should use a custom expiration time when options.expires is set", () => {
      const expires = 172800; // two days
      const updatedAt = { ...schema.updatedAt, expires };
      const expectedSchema = { ...schema, updatedAt };
      const store = new MongooseStore({ expires });
      expect(mongoose.Schema).to.have.been.calledWith(expectedSchema);
      expect(store.session).to.equal(model);
    });

    it("should use a custom model name when options.name is set", () => {
      const name = "Foo";
      const expectedArgs = [name, schema, options.collection];
      const store = new MongooseStore({ name });
      expect(mongoose.model).to.have.been.calledWith(...expectedArgs);
      expect(store.session).to.equal(model);
    });
  });

  describe("methods", () => {
    let id;
    let store;

    beforeEach(() => {
      id = "foobarbazqux";
      store = new MongooseStore();
    });

    describe("destroy", () => {
      it("should call model.remove", async () => {
        await store.destroy(id);
        expect(model.deleteOne).to.have.been.calledWith({ _id: id });
      });
    });

    describe("get", () => {
      it("should call model.findById", async () => {
        await store.get(id);
        expect(model.findById).to.have.been.calledWith(id);
      });

      it("should return session data", async () => {
        const { data } = session;
        const result = await store.get(id);
        expect(result).to.equal(data);
      });
    });

    describe("set", () => {
      it("should not call model.findByIdAndUpdate when there are not changes", async () => {
        const { data } = session;
        await store.set(id, data, null, {});
        expect(model.findByIdAndUpdate).to.not.have.been.called();
      });

      it("should call model.findByIdAndUpdate when there are changes", async () => {
        const { data } = session;
        await store.set(id, data, null, { changed: true });
        expect(model.findByIdAndUpdate).to.have.been.calledWith(id);
      });

      it('should call model.findByIdAndUpdate when "rolling" is set to true', async () => {
        const { data } = session;
        await store.set(id, data, null, { rolling: true });
        expect(model.findByIdAndUpdate).to.have.been.calledWith(id);
      });

      it("should return session data", async () => {
        const { data } = session;
        expect(await store.set(id, data, null, {})).to.equal(data);
        expect(await store.set(id, data, null, { changed: true })).to.equal(
          data
        );
        expect(await store.set(id, data, null, { rolling: true })).to.equal(
          data
        );
      });
    });
  });

  describe("static methods", () => {
    describe("create", () => {
      it("should return a session store with destroy, get, and set methods", () => {
        const store = MongooseStore.create();
        expect(store.destroy).to.be.a("function");
        expect(store.get).to.be.a("function");
        expect(store.set).to.be.a("function");
      });
    });
  });
});
