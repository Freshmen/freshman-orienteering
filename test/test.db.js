var db = require('../routes/db.js');
var should = require('should');

describe('Database', function() {
    describe('#getDocumentById', function() {
      it('should be a function', function() {
        db.getDocumentById.should.be.a["function"];
      });
      it('should return a document', function() {
        var mockReq = null;
        var mockRes = {};
        db.getDocumentById();
        //TODO: Add asyncronous test that it really returns an Array.
      });
    });
  });
