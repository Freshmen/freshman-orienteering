var mobile = require('../routes/mobile.js');
var should = require('should');

describe('routes/mobile', function() {
    describe('#show', function() {
      it('should be a function', function() {
        mobile.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = null;
        var mockRes = {
          render: function(viewName) {
            viewName.should.exist;
            viewName.should.match(/mobile/);
          }
        };
        mobile.show(mockReq, mockRes);
      });
    });
  });