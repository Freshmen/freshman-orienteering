var desktop = require('../routes/desktop.js');
var should = require('should');

describe('routes/desktop', function() {
    describe('#show', function() {
      it('should be an object', function() {
        desktop.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = {};
        mockReq.user = {};
        mockReq.user.name = "Test user";
        var mockRes = {
          render: function(viewName) {
            viewName.should.exist;
            viewName.should.match(/desktop/);
          }
        };
        desktop.show(mockReq, mockRes);
      });
    });
  });