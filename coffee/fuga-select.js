(function() {
  var $, FugaSelect, FugaSelectBase, FugaSelectDisplay, FugaSelectRemover, FugaSelectSearcher, FugaSelectToggler, root;
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
      this.menu_el = $('<ul></ul>').addClass('cllctr-options').insertAfter(this.element);
      return this._renderMenuContent();
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
      if ($(event.target).is('li')) return this._handleOptionClick(event);
    };

    FugaSelectBase.prototype._handleOptionClick = function(event) {
      var value;
      event.preventDefault();
      value = $(event.target).attr('data-cllctr-value');
      if (this._trigger('select', event, value)) return this._setValue(value);
    };

    FugaSelectBase.prototype._getValue = function() {
      if (this._value) return '' + this._value;
      if (this.element.is('select') || this.element.is('input')) {
        return '' + (this._value = this.element.val());
      }
    };

    FugaSelectBase.prototype._setValue = function(value) {
      if (this._trigger('change', value)) {
        if (this.element.is('select') || this.element.is('input')) {
          this.element.val(value);
        }
        return this._value = value;
      }
    };

    FugaSelectBase.prototype._options = function() {
      return this._options_chache || (this._options_chache = $.map(this._optionsFromOptions() || this._optionsFromSelect() || [], this._normalizeOption));
    };

    FugaSelectBase.prototype._normalizeOption = function(option) {
      if (typeof option === 'string') {
        return {
          value: option,
          label: option
        };
      }
      option.value = '' + option.value;
      return option;
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

    FugaSelectBase.prototype._renderMenuContent = function() {
      var option, _i, _len, _ref, _results;
      _ref = this._options();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        _results.push(this.menu().append(this._generateMenuOption(option)));
      }
      return _results;
    };

    FugaSelectBase.prototype._generateMenuOption = function(option) {
      return $('<li></li>').attr('data-cllctr-value', option.value).append($('<span />').text(option.label));
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
      this.display_el = $('<a></a>').attr('href', '#').attr('onclick', 'return false').addClass('cllctr-display').insertAfter(this.element);
      return this.display().append($('<span></span>').text(this._displayText())).append($("<div><b></b></div>"));
    };

    FugaSelectDisplay.prototype._removeDisplay = function() {
      if (this.display()) this.display().remove();
      return this.display_el = null;
    };

    FugaSelectDisplay.prototype._optionFromValue = function(value) {
      var matching_options;
      matching_options = $.grep(this._options(), function(option) {
        return option.value === value;
      });
      return matching_options[0];
    };

    FugaSelectDisplay.prototype._selectedOption = function() {
      return this._optionFromValue(this._getValue());
    };

    FugaSelectDisplay.prototype._setValue = function(new_value) {
      FugaSelectDisplay.__super__._setValue.call(this, new_value);
      return this.display().text(this._displayText());
    };

    FugaSelectDisplay.prototype._displayText = function() {
      if (this._selectedOption() && this._selectedOption().label && this._selectedOption().label !== '') {
        return this._selectedOption().label;
      }
      return this.options.placeholder || '';
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
      var container;
      this._removeContainer();
      container = $('<div />').addClass('cllctr-container').addClass('cllctr-collapsed').insertAfter(this.element);
      this.element.appendTo(container);
      if (this.display()) container.append(this.display());
      container.append($('<div />').addClass('cllctr-drawer'));
      if (this.menu()) return this.drawer().append(this.menu());
    };

    FugaSelectToggler.prototype._removeContainer = function() {
      if (this.container()) {
        this.element.insertBefore(this.container());
        if (this.display()) this.display().insertBefore(this.container());
        if (this.menu()) this.menu().insertBefore(this.container());
        if (this.drawer()) this.drawer().remove();
        return this.container().remove();
      }
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

    FugaSelectToggler.prototype._handleMenuClick = function(event) {
      FugaSelectToggler.__super__._handleMenuClick.call(this, event);
      return this.close();
    };

    FugaSelectToggler.prototype.container = function() {
      return this.element.parent('.cllctr-container');
    };

    FugaSelectToggler.prototype.drawer = function() {
      if (this.container()) return this.container().find('.cllctr-drawer');
    };

    FugaSelectToggler.prototype.toggle = function() {
      if (this.is_open()) {
        return this.close();
      } else {
        return this.open();
      }
    };

    FugaSelectToggler.prototype.is_open = function() {
      return this.container() && this.container().hasClass('cllctr-open');
    };

    FugaSelectToggler.prototype.open = function() {
      if (this._trigger('open')) {
        return this.container().removeClass('cllctr-collapsed').addClass('cllctr-open');
      }
    };

    FugaSelectToggler.prototype.close = function() {
      if (this._trigger('close')) {
        return this.container().removeClass('cllctr-open').addClass('cllctr-collapsed');
      }
    };

    return FugaSelectToggler;

  })();

  FugaSelectRemover = (function() {

    __extends(FugaSelectRemover, FugaSelectToggler);

    function FugaSelectRemover() {
      FugaSelectRemover.__super__.constructor.apply(this, arguments);
    }

    FugaSelectRemover.prototype.options = $.extend({}, FugaSelectToggler.options, {
      allow_remove: false,
      remove_text: ""
    });

    FugaSelectRemover.prototype._generateMenuOption = function(option) {
      if (this.options.allow_remove !== true) {
        return FugaSelectRemover.__super__._generateMenuOption.call(this, option);
      }
      return FugaSelectRemover.__super__._generateMenuOption.call(this, option).append($('<abbr />').addClass('cllctr-remove').text(this.options.remove_text));
    };

    FugaSelectRemover.prototype._handleMenuClick = function(event) {
      var value;
      if ($(event.target).is('abbr.cllctr-remove')) {
        event.preventDefault();
        value = $(event.target).parent('li').attr('data-cllctr-value');
        if (this._trigger('remove', event, value)) {
          return this.remove_option(value);
        }
      } else {
        return FugaSelectRemover.__super__._handleMenuClick.call(this, event);
      }
    };

    FugaSelectRemover.prototype.remove_option = function(value) {
      return this.menu().find('li[data-cllctr-value=' + value + ']').addClass('cllctr-removed');
    };

    FugaSelectRemover.prototype.unremove_option = function(value) {
      return this.menu().find('li[data-cllctr-value=' + value + ']').removeClass('cllctr-removed');
    };

    return FugaSelectRemover;

  })();

  FugaSelectSearcher = (function() {

    __extends(FugaSelectSearcher, FugaSelectRemover);

    function FugaSelectSearcher() {
      FugaSelectSearcher.__super__.constructor.apply(this, arguments);
    }

    FugaSelectSearcher.prototype._createElements = function() {
      var searcher;
      FugaSelectSearcher.__super__._createElements.call(this);
      if (this.options.allow_search === true) {
        searcher = $('<div />').addClass('cllctr-search').append($('<input>').attr('type', 'text').addClass('cllctr-searcher'));
        if (this.menu) {
          return this.menu().before(searcher);
        } else {
          return this.container().append(searcher);
        }
      }
    };

    FugaSelectSearcher.prototype._removeElements = function() {
      if (this.searcher()) this.searcher().remove();
      return FugaSelectSearcher.__super__._removeElements.call(this);
    };

    FugaSelectSearcher.prototype._setupBindings = function() {
      FugaSelectSearcher.__super__._setupBindings.call(this);
      if (this.searcher()) {
        return this.searcher().bind('keyup', $.proxy(this._handleSearcherTyping, this));
      }
    };

    FugaSelectSearcher.prototype._removeBindings = function() {
      if (this.searcher()) this.searcher().unbind('keyup');
      return FugaSelectSearcher.__super__._removeBindings.call(this);
    };

    FugaSelectSearcher.prototype.searcher = function() {
      if (this.container()) {
        return this.drawer().find('.cllctr-search input.cllctr-searcher');
      }
    };

    FugaSelectSearcher.prototype._handleSearcherTyping = function(event) {
      if (this._trigger('search', event, this.searcher().val())) {
        return this.search(this.searcher().val());
      }
    };

    FugaSelectSearcher.prototype.search = function(value) {
      if (this.searcher()) this.searcher().val(value);
      this._determineFilteredStates(value);
      this._applySearch({
        search_value: value
      });
      return this.container().addClass('cllctr-filtered');
    };

    FugaSelectSearcher.prototype._determineFilteredStates = function(value) {
      var option, _i, _len, _ref, _results;
      _ref = this._options();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        if (this._matchOption(option, value)) {
          _results.push(option.filtered = false);
        } else {
          _results.push(option.filtered = true);
        }
      }
      return _results;
    };

    FugaSelectSearcher.prototype._applySearch = function(params) {
      var li, option, _i, _len, _ref, _results;
      _ref = this._options();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        li = this.menu().find('li[data-cllctr-value=' + option.value + ']');
        if (params && params.search_value) {
          li.find('span').html(li.find('span').text().replace(params.search_value, "<em>" + params.search_value + "</em>"));
        }
        if (option.filtered === true) {
          _results.push(li.addClass('cllctr-filtered'));
        } else {
          _results.push(li.removeClass('cllctr-filtered'));
        }
      }
      return _results;
    };

    FugaSelectSearcher.prototype._matchOption = function(option, value) {
      return option.label.toLowerCase().indexOf('' + value.toLowerCase()) !== -1;
    };

    FugaSelectSearcher.prototype.unfilter = function() {
      return this.container().removeClass('cllctr-filtered');
    };

    return FugaSelectSearcher;

  })();

  FugaSelect = (function() {

    __extends(FugaSelect, FugaSelectSearcher);

    function FugaSelect() {
      FugaSelect.__super__.constructor.apply(this, arguments);
    }

    FugaSelect.prototype._createElements = function() {
      if (this.options.allow_create) this.options.allow_search = true;
      FugaSelect.__super__._createElements.call(this);
      return $('<a />').attr('href', '#').addClass('cllctr-creator').text('Create new...').insertBefore(this.menu());
    };

    FugaSelect.prototype._removeElements = function() {
      if (this.creator()) this.creator().remove();
      return FugaSelect.__super__._removeElements.call(this);
    };

    FugaSelect.prototype._setupBindings = function() {
      FugaSelect.__super__._setupBindings.call(this);
      if (this.creator()) {
        return this.creator().bind('click', $.proxy(this._handleCreatorClick, this));
      }
    };

    FugaSelect.prototype._removeBindings = function() {
      if (this.creator()) this.creator().unbind('click');
      return FugaSelect.__super__._removeBindings.call(this);
    };

    FugaSelect.prototype.creator = function() {
      return this.drawer().find('a.cllctr-creator');
    };

    FugaSelect.prototype._handleCreatorClick = function(event) {
      var option;
      event.preventDefault();
      option = {
        value: this._generateNewOptionValue(),
        label: this.searcher().val(),
        is_new: true
      };
      if (this._trigger('create', event, option)) this.add_option(option);
      return this.search('');
    };

    FugaSelect.prototype.add_option = function(option) {
      this._options().push(this._normalizeOption(option));
      this.menu().html('');
      return this._renderMenuContent();
    };

    FugaSelect.prototype._generateNewOptionValue = function() {
      var number;
      number = 1;
      while (this._optionFromValue('new' + number)) {
        number += 1;
      }
      return 'new' + number;
    };

    FugaSelect.prototype._perfectMatchOption = function(label) {
      var option, _i, _len, _ref;
      _ref = this._options();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        if (option.label.toLowerCase() === label.toLowerCase()) return option;
      }
      return null;
    };

    FugaSelect.prototype.search = function(value) {
      FugaSelect.__super__.search.call(this, value);
      if (this._perfectMatchOption(value) !== null) {
        return this.container().addClass('cllctr-perfect-match');
      }
    };

    FugaSelect.prototype._handleOptionClick = function(event) {
      var option, value;
      event.preventDefault();
      value = $(event.target).attr('data-cllctr-value');
      option = this._optionFromValue(value);
      if (option.is_new !== true || this._trigger('new_selected', event, option)) {
        return FugaSelect.__super__._handleOptionClick.call(this, event);
      }
    };

    return FugaSelect;

  })();

  $.widget('fuga.collector', new FugaSelect);

}).call(this);
