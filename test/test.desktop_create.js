var desktop_create = require('../routes/desktop_create.js');
var should = require('should');

describe('routes/desktop', function() {
    describe('#show', function() {
      it('should be a function', function() {
        desktop_create.show.should.be.a["function"];
      });
      it('should return a webpage', function() {
        var mockReq = null;
        var mockRes = {
          render: function(viewName) {
            viewName.should.exist;
            viewName.should.match(/desktop_create/);
          }
        };
        desktop_create.show(mockReq, mockRes);
      });
    });
  });