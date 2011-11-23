(function() {
  var $, FugaSelect, FugaSelectBase, FugaSelectDisplay, FugaSelectToggler, root;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = this;

  $ = jQuery;

  FugaSelectBase = (function() {

    function FugaSelectBase() {}

    FugaSelectBase.prototype._create = function() {
      this.element.hide();
      this._createElements();
      return this._setupBindings();
    };

    FugaSelectBase.prototype.destroy = function() {
      this._removeBindings();
      this._removeElements();
      return this.element.show();
    };

    FugaSelectBase.prototype._createElements = function() {
      if (this.menu_el) this.menu_el.remove();
      return this.menu_el = this._generateMenu().insertAfter(this.element);
    };

    FugaSelectBase.prototype._removeElements = function() {
      if (this.menu_el) this.menu_el.remove();
      return this.menu_el = null;
    };

    FugaSelectBase.prototype._setupBindings = function() {
      this.element.bind('change', $.proxy(this._handleChange, this));
      if (this.menu_el) {
        return this.menu_el.click($.proxy(this._handleMenuClick, this));
      }
    };

    FugaSelectBase.prototype._removeBindings = function() {
      return this.element.unbind('change');
    };

    FugaSelectBase.prototype._handleChange = function(event) {
      return this._setValue(this.element.val());
    };

    FugaSelectBase.prototype._handleMenuClick = function(event) {
      var value;
      if ($(event.target).is('a')) {
        event.preventDefault();
        value = $(event.target).parent('li').attr('value');
        if (this._trigger('select', event, value)) return this._setValue(value);
      }
    };

    FugaSelectBase.prototype._getValue = function() {
      return this.element.val();
    };

    FugaSelectBase.prototype._setValue = function(value) {
      if (this._trigger('change', value)) return this.element.val(value);
    };

    FugaSelectBase.prototype._availableOptions = function() {
      return this._availableOptionsCache || (this._availableOptionsCache = this._optionsFromOptions() || this._optionsFromSelect() || []);
    };

    FugaSelectBase.prototype._optionsFromOptions = function() {
      return this.options.options;
    };

    FugaSelectBase.prototype._optionsFromSelect = function() {
      if (!this.element.is('select')) return null;
      return $.map(this.element.find('option'), function(option) {
        return {
          value: $(option).attr('value'),
          label: $(option).text()
        };
      });
    };

    FugaSelectBase.prototype._generateMenu = function(options) {
      var menu, self;
      options || (options = this._availableOptions());
      menu = $('<ul></ul>').addClass('collector-options');
      self = this;
      $.each(options, function(index, option) {
        return self._generateMenuOption(option).appendTo(menu);
      });
      return menu;
    };

    FugaSelectBase.prototype._generateMenuOption = function(option) {
      return $('<li></li>').attr('value', option.value).append($('<a></a>').text(option.label));
    };

    FugaSelectBase.prototype.value = function(new_value) {
      if (new_value) return this._setValue(new_value);
      return this._getValue();
    };

    FugaSelectBase.prototype.menu = function() {
      return this.menu_el;
    };

    return FugaSelectBase;

  })();

  FugaSelectDisplay = (function() {

    __extends(FugaSelectDisplay, FugaSelectBase);

    function FugaSelectDisplay() {
      FugaSelectDisplay.__super__.constructor.apply(this, arguments);
    }

    FugaSelectDisplay.prototype.options = $.extend({}, FugaSelectBase.options, {
      placeholder: ""
    });

    FugaSelectDisplay.prototype._createElements = function() {
      FugaSelectDisplay.__super__._createElements.call(this);
      return this._createDisplay();
    };

    FugaSelectDisplay.prototype._removeElements = function() {
      this._removeDisplay();
      return FugaSelectDisplay.__super__._removeElements.call(this);
    };

    FugaSelectDisplay.prototype._createDisplay = function() {
      this._removeDisplay();
      this.display_el = $('<a></a>').attr('href', '#').attr('onclick', 'return false').addClass('collector-display').insertAfter(this.element);
      return this.display().text(this._displayText());
    };

    FugaSelectDisplay.prototype._removeDisplay = function() {
      if (this.display()) this.display().remove();
      return this.display_el = null;
    };

    FugaSelectDisplay.prototype._selectedOption = function() {
      var result, self;
      self = this;
      result = {};
      $.each(this._availableOptions(), function(index, option) {
        if (option.value === self._getValue()) return result = option;
      });
      return result;
    };

    FugaSelectDisplay.prototype._setValue = function(new_value) {
      FugaSelectDisplay.__super__._setValue.call(this, new_value);
      return this.display().text(this._displayText());
    };

    FugaSelectDisplay.prototype._displayText = function() {
      if (this._selectedOption() && this._selectedOption().label !== '') {
        return this._selectedOption().label;
      }
      return this.options.placeholder;
    };

    FugaSelectDisplay.prototype.display = function() {
      return this.display_el;
    };

    return FugaSelectDisplay;

  })();

  FugaSelectToggler = (function() {

    __extends(FugaSelectToggler, FugaSelectDisplay);

    function FugaSelectToggler() {
      FugaSelectToggler.__super__.constructor.apply(this, arguments);
    }

    FugaSelectToggler.prototype._createElements = function() {
      FugaSelectToggler.__super__._createElements.call(this);
      return this._createContainer();
    };

    FugaSelectToggler.prototype._removeElements = function() {
      this._removeContainer();
      return FugaSelectToggler.__super__._removeElements.call(this);
    };

    FugaSelectToggler.prototype._createContainer = function() {
      this._removeContainer();
      this.container_el = $('<div />').addClass('collector-container').addClass('collector-closed').insertAfter(this.element);
      this.element.appendTo(this.container());
      if (this.display()) this.display().appendTo(this.container());
      if (this.menu()) return this.menu().appendTo(this.container());
    };

    FugaSelectToggler.prototype._removeContainer = function() {
      if (this.container()) {
        this.element.insertBefore(this.container());
        if (this.display()) this.display().insertBefore(this.container());
        if (this.menu()) this.menu().insertBefore(this.container());
        this.container().remove();
      }
      return this.container_el = null;
    };

    FugaSelectToggler.prototype._setupBindings = function() {
      FugaSelectToggler.__super__._setupBindings.call(this);
      if (this.display()) {
        return this.display().bind('click', $.proxy(this._handleDisplayClick, this));
      }
    };

    FugaSelectToggler.prototype._removeBindings = function() {
      if (this.display()) this.display().unbind('click');
      return FugaSelectToggler.__super__._removeBindings.call(this);
    };

    FugaSelectToggler.prototype._handleDisplayClick = function() {
      return this.toggle();
    };

    FugaSelectToggler.prototype.container = function() {
      return this.container_el;
    };

    FugaSelectToggler.prototype.toggle = function() {
      if (this.is_open()) {
        return this.close();
      } else {
        return this.open();
      }
    };

    FugaSelectToggler.prototype.is_open = function() {
      return this.container() && this.container().hasClass('collector-open');
    };

    FugaSelectToggler.prototype.open = function() {
      if (this._trigger('open')) {
        return this.container().removeClass('collector-closed').addClass('collector-open');
      }
    };

    FugaSelectToggler.prototype.close = function() {
      if (this._trigger('close')) {
        return this.container().removeClass('collector-open').addClass('collector-closed');
      }
    };

    return FugaSelectToggler;

  })();

  FugaSelect = (function() {

    __extends(FugaSelect, FugaSelectToggler);

    function FugaSelect() {
      FugaSelect.__super__.constructor.apply(this, arguments);
    }

    FugaSelect.prototype.options = $.extend({}, FugaSelectToggler.options, {
      allow_remove: false,
      remove_text: "remove"
    });

    FugaSelect.prototype._generateMenuOption = function(option) {
      if (this.options.allow_remove !== true) {
        return FugaSelect.__super__._generateMenuOption.call(this, option);
      }
      return FugaSelect.__super__._generateMenuOption.call(this, option).append($('<a></a>').attr('href', '#').addClass('collector-remove').text(this.options.remove_text));
    };

    FugaSelect.prototype._handleMenuClick = function(event) {
      var value;
      if ($(event.target).is('a.collector-remove')) {
        event.preventDefault();
        value = $(event.target).parent('li').attr('value');
        if (this._trigger('remove', event, value)) {
          return this.remove_option(value);
        }
      } else {
        return FugaSelect.__super__._handleMenuClick.call(this, event);
      }
    };

    FugaSelect.prototype.remove_option = function(value) {
      return this.menu().find('li[value=' + value + ']').addClass('collector-removed');
    };

    FugaSelect.prototype.unremove_option = function(value) {
      return this.menu().find('li[value=' + value + ']').removeClass('collector-removed');
    };

    return FugaSelect;

  })();

  $.widget('fuga.collector', new FugaSelect);

}).call(this);
