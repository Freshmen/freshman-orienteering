var db = require('../routes/db.js');
var should = require('should');

describe('Database', function() {
    describe('#getEvents', function() {
      it('should be a function', function() {
        db.getEvents.should.be.a["function"];
      });
      it('should return a list of all events', function() {
        var mockReq = null;
        var mockRes = {};
        db.getEvents(mockReq, mockRes);
        //TODO: Add asyncronous test that it really returns an Array.
      });
    });
  });
