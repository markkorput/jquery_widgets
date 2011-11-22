(function() {
  var $, CautiousWidget, CautiousWidget2, root;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = this;

  $ = jQuery;

  CautiousWidget = {
    options: {
      delay: 900
    },
    _create: function() {
      return this._setup_bindings();
    },
    _destroy: function() {
      return this._remove_bindings();
    },
    _setup_bindings: function() {
      return this.element.bind('keydown', $.proxy(this._handleKeyDown, this));
    },
    _remove_bindings: function() {
      return this.element.unbind('keydown');
    },
    _handleKeyDown: function(event) {
      if (this._ready()) {
        this._trigger('start');
        this._lastInputTime = event.timeStamp;
        return this._checkStillTyping();
      } else {
        return this._lastInputTime = event.timeStamp;
      }
    },
    _timeTillReady: function() {
      if (this._lastInputTime) {
        return this._lastInputTime + this.options.delay - (new Date).getTime();
      } else {
        return 0;
      }
    },
    _ready: function() {
      return this._timeTillReady() <= 0;
    },
    _checkStillTyping: function() {
      if (this._ready()) {
        return this._enterReadyState();
      } else {
        return window.setTimeout($.proxy(this._checkStillTyping, this), this._timeTillReady() - 5);
      }
    },
    _enterReadyState: function() {
      this._trigger('stop');
      if (this.element.val() === '') {
        this._trigger('empty');
        this._trigger('nevermind');
      } else {
        if (this.element.val() !== this._previousValue) {
          this._trigger('new', 0, this.element.val());
        } else {
          this._trigger('same', 0, this.element.val());
          this._trigger('nevermind');
        }
      }
      return this._previousValue = this.element.val();
    }
  };

  CautiousWidget2 = {
    _enterReadyState: function() {
      // return _enterReadyState.__super__.constructor.call(this);
      return CautiousWidget._enterReadyState.apply(this);
    }
  };

  // __extends(CautiousWidget2, CautiousWidget);

  $.widget('fuga.cautious', $.extend(CautiousWidget, CautiousWidget2));

}).call(this);
