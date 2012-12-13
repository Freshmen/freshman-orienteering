var index = require('../routes/index.js');

describe('routes/index', function() {
    describe('#show', function() {
      it('should be a function', function() {
        index.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = null;
        var mockRes = {
          render: function(viewName) {
            viewName.should.exist;
          }
        };
        index.show(mockReq, mockRes);
      });
    });
  });