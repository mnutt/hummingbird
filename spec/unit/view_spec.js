describe 'View'
  describe '.urlKey()'
    it 'extracts a url_key from a sale url'
      var env = { u: "http://localhost/s/gucci" }

      var view = new v.View(env)
      view.urlKey().should.equal "gucci"
    end

    it 'extracts a url_key from a city offer url'
      var env = { u: "http://newyork.gilt.com/city/offer/rougetomate" }
      var view = new v.View(env)
      view.urlKey().should.equal "rougetomate"
    end

    it 'extracts a url_key from a product url'
      var env = { u: "http://localhost/s/gucci/product/12345" }

      var view = new v.View(env)
      view.urlKey().should.equal "gucci"
    end

    it 'handles bad urls gracefully'
      var env = { u: "asdfasfasd/sdfof/foo" }

      var view = new v.View(env)
      view.urlKey().should.be_null
    end
  end

  describe '.productId()'
    it 'extracts the product id'
      var env = { u: "http://localhost/s/gucci/product/12345" }

      var view = new v.View(env)
      view.productId().should.equal "12345"
    end

    it 'handles other stuff at the end of the url'
      var env = { u: "http://localhost/s/gucci/product/12345?foobar" }

      var view = new v.View(env)
      view.productId().should.equal "12345"
    end

    it 'should not extract a productId from a city offer url'
      var env = { u: "http://newyork.gilt.com/city/offer/rougetomate" }
      var view = new v.View(env)
      isNaN(view.productId()).should.be_true
    end
  end

  describe '.event()'
    it 'extracts the cart_add event'
      var env = { events: "scAdd,scJunk" }
      var view = new v.View(env);

      view.event().should.equal "cart_add"
    end
  end
end