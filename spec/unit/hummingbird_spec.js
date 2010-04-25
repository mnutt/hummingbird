describe 'Hummingbird'
  describe '.writePixel'
    it 'outputs a 1x1 tracking pixel to the response'
      var req = new MockRequest("/tracking.gif")
      var res = new MockResponse()
      var hummingbird = new hb.Hummingbird(db, function() {})

      hummingbird.writePixel(res)

      res.data.length.should.equal 43
      res.state.should.equal "closed"
      res.data.should.match /GIF/
    end
  end

  describe '.addClient'
    it 'increases the allViewsMetric client count by 1'
      var hummingbird = new hb.Hummingbird(db, function() {});
      var mockClient = {};

      hummingbird.metrics[0].clients.length.should.equal 0
      hummingbird.addClient(mockClient);
      hummingbird.metrics[0].clients.length.should.equal 1
    end
  end

  describe '.removeClient'
    it 'decreases the allViewsMetric client count by 1'
      var hummingbird = new hb.Hummingbird(db, function() {});
      var mockClient = {};
      hummingbird.addClient(mockClient);

      hummingbird.metrics[0].clients.length.should.equal 1
      hummingbird.removeClient(mockClient);
      hummingbird.metrics[0].clients.length.should.equal 0
    end
  end

  describe '.serveRequest'
    it 'adds a timestamp to the environment'
      var hummingbird = new hb.Hummingbird(db, function() {})
      var req = new MockRequest("http://localhost/t.gif?u=foobar")
      var res = new MockResponse()
      var collection = new MockCollection()
      hummingbird.setCollection(collection)

      hummingbird.serveRequest(req, res)

      collection.inserts[0].timestamp.should.be_greater_than 1270000000000
      collection.inserts[0].timestamp.should.be_less_than 1970000000000
    end
  end
end
