var index = require('../routes/index.js');
var should = require('should');

describe('routes/index', function() {
    describe('#show', function() {
      it('should be a function', function() {
        index.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = {};
        mockReq.headers = {};
        mockReq.headers['user-agent'] = "android";
        var mockRes = {
          render: function(viewName) {
            viewName.should.exist;
          }
        };
        index.show(mockReq, mockRes);
      });
    });
  });