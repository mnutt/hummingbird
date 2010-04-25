describe 'Metric'
  describe '.addValue'
    it 'calls the passed "addHandler" function'
      var metric = new m.Metric('test', {foo: 0}, 100, db, function(view) {
        this.data.foo = view;
      });
      var view = 5;
      metric.addValue(view);

      metric.data.foo.should.equal 5
    end
  end

  describe '.insertData'
    it 'inserts the metric\'s data into the database with a timestamp'
      var metric = new m.Metric('test', {foo: 0}, 100, db, function(view) {
        this.data.foo = view;
        metric.insertData();
      });
 
      // metric.addValue(5);
      // TODO
    end
  end

  describe '.addClient'
    it 'adds the client to the client array'
      var metric = new m.Metric('test', {foo: 0}, 100, db, function() {});
      var client = {};
      metric.addClient(client);
      metric.clients.length.should.equal 1
      metric.clients[0].should.equal client
    end
  end

  describe '.removeClient'
    it 'removes the client from the client array'
      var metric = new m.Metric('test', {foo: 0}, 100, db, function() {});
      var client = {};
      metric.addClient(client);

      metric.removeClient(client);

      metric.clients.length.should.equal 0
    end
  end
end