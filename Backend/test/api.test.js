"use strict";

const app = require("../server"),
  chai = require("chai"),
  request = require("supertest");

const expect = chai.expect;

describe("Message API Tests", function() {
  describe("#POST / message", function() {
    it("should recieve message", function(done) {
      request(app)
        .post("/text")
        .send({ text: "This is a test" })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.be.an("string");
          done();
        });
    });
  });
});
