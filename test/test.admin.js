var admin = require('../routes/admin.js');
var should = require('should');

describe('routes/admin', function() {
    describe('#index', function() {
      it('should be a function', function() {
        admin.index.should.be.a["function"];
      });
    });
  });