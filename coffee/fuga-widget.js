(function() {
  var $, FugaWidget, FugaWidget2, root;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = this;

  $ = jQuery;

  FugaWidget = (function() {

    function FugaWidget() {}

    FugaWidget.prototype._create = function() {
      return this._setup_bindings();
    };

    FugaWidget.prototype._destroy = function() {
      return this._remove_bindings();
    };

    FugaWidget.prototype._setup_bindings = function() {
      return this.element.bind('change', $.proxy(this._handleChange, this));
    };

    FugaWidget.prototype._remove_bindings = function() {
      return this.element.unbind('change');
    };

    FugaWidget.prototype._handleChange = function(event) {
      return this._setValue(this.element.val());
    };

    FugaWidget.prototype._getValue = function() {
      return this.element.val();
    };

    FugaWidget.prototype._setValue = function(value) {
      return this.element.val(value);
    };

    FugaWidget.prototype.value = function(new_value) {
      if (new_value) return this._setValue(new_value);
      return this._getValue();
    };

    return FugaWidget;

  })();

  FugaWidget2 = (function() {

    __extends(FugaWidget2, FugaWidget);

    function FugaWidget2() {
      FugaWidget2.__super__.constructor.apply(this, arguments);
    }

    FugaWidget2.prototype._setValue = function(value) {
      FugaWidget2.__super__._setValue.call(this, value);
      return this._trigger('change');
    };

    return FugaWidget2;

  })();

  $.widget('fuga.fugawidget', new FugaWidget2);

}).call(this);
