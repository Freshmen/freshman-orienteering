var admin = require('../routes/admin.js');
var should = require('should');

describe('routes/admin', function() {
    describe('#show', function() {
      it('should be a function', function() {
        admin.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = null;
        var mockRes = {
          render: function(viewName) {
            viewName.should.exist;
            viewName.should.match(/admin/);
          }
        };
        admin.show(mockReq, mockRes);
      });
    });
  });