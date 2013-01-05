var login = require('../routes/login.js');
var should = require('should');

describe('routes/login', function() {
    describe('#show', function() {
      it('should be a function', function() {
    	  login.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = null;
        var mockRes = {
          render: function(viewName) {
            viewName.should.exist;
          }
        };
        login.show(mockReq, mockRes);
      });
    });
  });