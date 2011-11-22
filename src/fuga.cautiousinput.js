// CautiousInput
(function($){

  jQuery.widget('ui.cautious', {
    // default options
    options: {delay: 400},

    // set-up the widget by declaring the bindings
    _create: function(){
      // need this because of scope issues
      self = this;

      // some stuff needs to happen when the user types in the text field
      this.element.bind('keydown', function(event){
        // if the input class is in ready state; trigger start typing event
        // and start monitoring until the user stops typing
        if(self._ready()){
          self._trigger('start');

          // keep track of the time(-stamp) of the last input; this needs to happen
          // AFTER the _ready check, and BEFORE de _checkStillTyping loop
          self._lastInputTime = event.timeStamp;

          // check if the user is still typing; this function will keep calling
          // itself with intervals, until the user stopped typing long enough
          self._checkStillTyping();
        } else {
          // keep track of the time(-stamp) of the last input
          self._lastInputTime = event.timeStamp;
        }
      });
    }, // end of _create function

    _destroy: function(){ this.element.unbind('keydown'); },

    _timeTillReady: function(){
      return this._lastInputTime === undefined ? 0 : (this._lastInputTime + this.options.delay - (new Date).getTime());
    },// end of _timeTillReady function
    // ready checks if enough time passed since previous input
    // using this.options.delay indicates how much time is 'enough'

    _ready: function(){
      // when no previous timestamp found; means we're in ready state, otherwise check if enough time has passed since last input
      return this._timeTillReady() <= 0;
    }, // end of _ready function

    _checkStillTyping: function(){
      if(this._ready()){
        // ready? trigger stopTyping event
        this._trigger('stop');

        // only trigger newValue event when the previous stopTyping event was on a different value
        if(this.element.val() == ''){
          this._trigger('empty');
          // special "nevermind" callback indicating typing didn't turn out to be useful
          this._trigger('nevermind');
        } else if(this.element.val() != this._previousValue){
          this._trigger('new', 0, this.element.val());
        // otherwise trigger sameValue event
        }else{
          this._trigger('same', 0, this.element.val());
          // special "nevermind" callback indicating typing didn't turn out to be useful
          this._trigger('nevermind', 0, this.element.val());
        }

        // save previous value for next time
        this._previousValue = this.element.val();
      } else {
        // check again in _timeTillReady minus 5ms
        // this complicated syntax is needed to let this function call itself and maintain a usefull reference in `this`
        window.setTimeout(function(obj){ return function(){obj._checkStillTyping();}}(this), this._timeTillReady()-10);
      }
    } // end of _checkStillTyping function

  }); // end of 'ui.cautiousInput' widget definition
})(jQuery);

