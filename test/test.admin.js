var admin = require('../routes/admin.js');
var should = require('should');

describe('routes/admin', function() {
    describe('#show', function() {
      it('should be a function', function() {
        admin.show.should.be.a["function"];
      });
    });
  });