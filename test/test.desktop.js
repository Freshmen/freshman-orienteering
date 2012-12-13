var desktop = require('../routes/desktop.js');
var should = require('should');

describe('routes/desktop', function() {
    describe('#show', function() {
      it('should be a function', function() {
        desktop.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = null;
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