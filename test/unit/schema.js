"use strict";

const chai = require("chai");
const dirtyChai = require("dirty-chai");

const schema = require("../../lib/schema");

const { expect } = chai;

chai.use(dirtyChai);

describe("schema", () => {
  it("should be an object", () => {
    expect(schema).to.be.an("object");
  });
});
