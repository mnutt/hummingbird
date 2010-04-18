describe 'Hummingbird'
  describe '.writePixel'
    it 'outputs a 1x1 tracking pixel to the response'
      var req = new MockRequest("/tracking.gif")
      var res = new MockResponse()
      var hummingbird = new hb.Hummingbird()

      hummingbird.writePixel(res)

      res.data.length.should.equal 43
      res.state.should.equal "closed"
      res.data.should.match /GIF/
    end
  end

  describe '.addClient'
    it 'increases the allViewsMetric client count by 1'
      var hummingbird = new hb.Hummingbird();
      var mockClient = {};

      hummingbird.allViewsMetric.clients.length.should.equal 0
      hummingbird.addClient(mockClient);
      hummingbird.allViewsMetric.clients.length.should.equal 1
    end
  end

  describe '.removeClient'
    it 'decreases the allViewsMetric client count by 1'
      var hummingbird = new hb.Hummingbird();
      var mockClient = {};
      hummingbird.addClient(mockClient);

      hummingbird.allViewsMetric.clients.length.should.equal 1
      hummingbird.removeClient(mockClient);
      hummingbird.allViewsMetric.clients.length.should.equal 0
    end
  end
end
