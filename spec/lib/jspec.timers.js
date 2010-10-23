
// Mock Timers - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

;(function(){
  
  /**
   * Localized timer stack.
   */
  var timers = [];
  
  // nodejs, rhino don't have a window object
  var global = this;
  
  // if they where mocked before this library is loaded - bad luck
  var savedGlobals = {
    setTimeout: global.setTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    clearTimeout: global.clearTimeout,
    
    // those should not be globals, but are mocked none the less, so we save them
    resetTimers: global.resetTimers,
    tick: global.tick
  };
  var hadResetTimers = 'resetTimers' in global;
  var hadTick = 'tick' in global;
  
  function forEachProperty(anObject, aClosure) {
    for (var key in anObject) {
      if ( ! anObject.hasOwnProperty(key))
        continue;
      
      aClosure(key, anObject[key]);
    }
  }
  
  global.MockTimers = {
    
    mockTimersVersion: '2.0.0',
    
    mockGlobalTimerFunctions: function() {
      forEachProperty(this.mocks, function(aName, aFunction) {
        global[aName] = aFunction;
      });
    },
    
    unmockGlobalTimerFunctions: function() {
      forEachProperty(this.savedGlobals, function(aName, aFunction) {
        global[aName] = aFunction;
      });
      
      if ( ! hadResetTimers)
        delete global['resetTimers'];
      if ( ! hadTick)
        delete global['tick'];
      
    }
  };
  
  function clearTimer(id) {
    return delete timers[--id];
  }
  
  var mocks = {
    
    /**
     * Set mock timeout with _callback_ and timeout of _ms_.
     *
     * @param  {function} callback
     * @param  {int} ms
     * @return {int}
     * @api public
     */
    setTimeout: function(callback, ms) {
      var id;
      return id = setInterval(function(){
        callback();
        clearInterval(id);
      }, ms);
    },


   /**
    * Set mock interval with _callback_ and interval of _ms_.
    *
    * @param  {function} callback
    * @param  {int} ms
    * @return {int}
    * @api public
    */
    setInterval: function(callback, ms) {
      // REFACT: use wrapper object so callback is not changed -> state leak
      callback.step = ms;
      callback.current = callback.last = 0;
      timers[timers.length] = callback;
      return timers.length;
    },
    
    /**
     * Destroy timer with _id_.
     *
     * @param  {int} id
     * @return {bool}
     * @api public
     */
    clearInterval: clearTimer,
    clearTimeout: clearTimer
  };
  
  // additional functions that are not originally in the global namespace
  /**
   * Reset timers.
   *
   * @return {array}
   * @api public
   */
  mocks.resetTimers = function() {
    return timers = [];
  };
  
  /**
   * Increment each timers internal clock by _ms_.
   *
   * @param  {int} ms
   * @api public
   */
  mocks.tick = function(ms) {
    for (var i = 0, len = timers.length; i < len; ++i) {
      if ( ! timers[i] || ! (timers[i].current += ms))
        continue;
      
      if (timers[i].current - timers[i].last < timers[i].step)
        continue;
      
      var times = Math.floor((timers[i].current - timers[i].last) / timers[i].step);
      var remainder = (timers[i].current - timers[i].last) % timers[i].step;
      timers[i].last = timers[i].current - remainder;
      while (times-- && timers[i])
        timers[i]();
    }
  };
  
  // make them available publicly
  MockTimers.mocks = mocks;
  
  JSpec.include({
    beforeSpec: function(){
      MockTimers.mockGlobalTimerFunctions();
    },
    afterSpec : function() {
      MockTimers.unmockGlobalTimerFunctions();
    }
  });
})();