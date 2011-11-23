(function() {
  var $, root;

  root = this;

  $ = jQuery;

  describe("Collector (Base)", function() {
    beforeEach(function() {
      this.html = '<select><option value="1">first</option><option value="2">second</option></select>';
      return this.widget = $(this.html).appendTo($('body')).collector();
    });
    afterEach(function() {
      this.widget.collector('destroy');
      return this.widget.remove();
    });
    it("should generate an options list", function() {
      return expect(this.widget.collector('menu').find('li').length).toEqual(2);
    });
    it("should provide a value getter", function() {
      return expect(this.widget.collector('value')).toEqual('1');
    });
    it("should change value when an option is clicked", function() {
      this.widget.collector('menu').find('li:eq(1) a:first').click();
      return expect(this.widget.collector('value')).toEqual('2');
    });
    it("should distribute new value to the original element", function() {
      this.widget.collector('value', 2);
      return expect(this.widget.val()).toEqual('2');
    });
    it("should trigger change event when value changes through value setter", function() {
      spyOnEvent(this.widget, 'collectorchange');
      this.widget.collector('value', 'second');
      return expect('collectorchange').toHaveBeenTriggeredOn(this.widget);
    });
    it("should trigger change event when an options is clicked changes through value setter", function() {
      spyOnEvent(this.widget, 'collectorchange');
      this.widget.collector('menu').find('li a:first-child')[1].click();
      return expect('collectorchange').toHaveBeenTriggeredOn(this.widget);
    });
    it("should hide the original dom-element", function() {
      return expect(this.widget).not.toBeVisible();
    });
    it("should remove the option list on cleanup", function() {
      this.widget.collector('destroy');
      expect(this.widget.collector('menu')).not.toExist();
      return expect(this.widget).toBeVisible();
    });
    return it("should provide an option to specify the available choices", function() {
      var widget;
      widget = $('<div />').appendTo($('body')).collector({
        options: [
          {
            value: 1,
            label: 'no 1'
          }, {
            value: 2,
            label: 'no 2'
          }, {
            value: 3,
            label: 'no 3'
          }
        ]
      });
      this.after(function() {
        widget.collector('destroy');
        return widget.remove();
      });
      return expect($.map(widget.collector('menu').find('li a:first-child'), function(a) {
        return $(a).text();
      })).toEqual(['no 1', 'no 2', 'no 3']);
    });
  });

  describe("Collector (Display)", function() {
    beforeEach(function() {
      this.html = '<select><option value="1">first</option><option value="2">second</option></select>';
      return this.widget = $(this.html).appendTo($('body')).collector();
    });
    afterEach(function() {
      this.widget.collector('destroy');
      return this.widget.remove();
    });
    it("should render a value displayer", function() {
      return expect(this.widget.collector('display')).toBeVisible();
    });
    it("should remove the value displayer at destroy", function() {
      this.widget.collector('destroy');
      return expect(this.widget.collector('display')).not.toExist();
    });
    it("should update the display when the value changes", function() {
      this.widget.collector('value', '2');
      expect(this.widget.collector('display').text()).toEqual('second');
      this.widget.collector('menu').find('li:first a:first').click();
      return expect(this.widget.collector('display').text()).toEqual('first');
    });
    return it("should show a placeholder text", function() {
      var widget2;
      widget2 = $('<select><option></option><option value="1">first</option><option value="2">second</option></select>').appendTo('body').collector({
        placeholder: 'Make a choice!'
      });
      expect(widget2.collector('display').text()).toEqual('Make a choice!');
      widget2.collector('destroy');
      return widget2.remove();
    });
  });

  describe("Collector (Toggling)", function() {
    beforeEach(function() {
      this.html = '<select><option value="1">first</option><option value="2">second</option><option value="3">third</option></select>';
      return this.widget = $(this.html).appendTo($('body')).collector();
    });
    afterEach(function() {
      this.widget.collector('destroy');
      return this.widget.remove();
    });
    it("should render the displayer and options menu withing a wrapper", function() {
      expect(this.widget.collector('container')).toExist();
      expect(this.widget.collector('container')).toContain('select');
      expect(this.widget.collector('container')).toContain('a.collector-display');
      return expect(this.widget.collector('container')).toContain('ul.collector-options');
    });
    it("should hide the options menu by default", function() {
      return expect(this.widget.collector('container')).toHaveClass('collector-closed');
    });
    it("should toggle the options menu when clicking on the display", function() {
      this.widget.collector('display').click();
      expect(this.widget.collector('container')).toHaveClass('collector-open');
      expect(this.widget.collector('container')).not.toHaveClass('collector-closed');
      this.widget.collector('display').click();
      expect(this.widget.collector('container')).toHaveClass('collector-closed');
      return expect(this.widget.collector('container')).not.toHaveClass('collector-open');
    });
    it("should provide open and close methods", function() {
      this.widget.collector('open');
      expect(this.widget.collector('container')).toHaveClass('collector-open');
      this.widget.collector('close');
      return expect(this.widget.collector('container')).toHaveClass('collector-closed');
    });
    it("should trigger open events", function() {
      this.widget.collector('open');
      return expect(this.widget.collector('container')).toHaveClass('collector-open');
    });
    it("should trigger an open event when the menu opens through the method", function() {
      spyOnEvent(this.widget, 'collectoropen');
      this.widget.collector('open');
      return expect('collectoropen').toHaveBeenTriggeredOn(this.widget);
    });
    it("should trigger an open event when the menu opens by a click", function() {
      spyOnEvent(this.widget, 'collectoropen');
      this.widget.collector('display').click();
      return expect('collectoropen').toHaveBeenTriggeredOn(this.widget);
    });
    it("should trigger a close event when the menu closes through the method", function() {
      spyOnEvent(this.widget, 'collectorclose');
      this.widget.collector('close');
      return expect('collectorclose').toHaveBeenTriggeredOn(this.widget);
    });
    it("should trigger a close event when the menu closes by a click", function() {
      spyOnEvent(this.widget, 'collectorclose');
      this.widget.collector('display').click();
      this.widget.collector('display').click();
      return expect('collectorclose').toHaveBeenTriggeredOn(this.widget);
    });
    return it("should cleanup nicely put the original element back and remove the container", function() {
      this.widget.collector('destroy');
      expect(this.widget.collector('container')).not.toExist();
      return expect(this.widget).toBeVisible();
    });
  });

  describe("Collector (Removing)", function() {
    beforeEach(function() {
      this.html = '<select><option value="1">first</option><option value="2">second</option><option value="3">third</option></select>';
      return this.widget = $(this.html).appendTo($('body')).collector({
        allow_remove: true,
        remove_text: 'Get rid of this!'
      });
    });
    afterEach(function() {
      this.widget.collector('destroy');
      return this.widget.remove();
    });
    it("should add delete links to each menu item", function() {
      return expect(this.widget.collector('menu').find('li a.collector-remove').length).toEqual(3);
    });
    it("should provide a remove_text option that specifies remove link content", function() {
      return expect(this.widget.collector('menu').find('li:first a.collector-remove').text()).toEqual('Get rid of this!');
    });
    it("should trigger a remove event when a remove link is clicked", function() {
      spyOnEvent(this.widget, 'collectorremove');
      this.widget.collector('menu').find('li:first a.collector-remove').click();
      return expect('collectorremove').toHaveBeenTriggeredOn(this.widget);
    });
    it("should add the collector-removed class to removed items", function() {
      var li;
      li = this.widget.collector('menu').find('li:eq(1)');
      expect(li).not.toHaveClass('collector-removed');
      li.find('a.collector-remove').click();
      return expect(li).toHaveClass('collector-removed');
    });
    it("should provide easy value-based interface to manually remove options", function() {
      expect(this.widget.collector('menu').find('li:last')).not.toHaveClass('collector-removed');
      this.widget.collector('remove_option', '3');
      return expect(this.widget.collector('menu').find('li:last')).toHaveClass('collector-removed');
    });
    it("should provide easy value-based interface to unremove options", function() {
      expect(this.widget.collector('menu').find('li:last')).not.toHaveClass('collector-removed');
      this.widget.collector('remove_option', '3');
      expect(this.widget.collector('menu').find('li:last')).toHaveClass('collector-removed');
      this.widget.collector('unremove_option', '3');
      return expect(this.widget.collector('menu').find('li:last')).not.toHaveClass('collector-removed');
    });
    return it("shouldn't add the remove links by default", function() {
      var html2, widget2;
      html2 = '<select><option value="1">first</option><option value="2">second</option><option value="3">third</option></select>';
      widget2 = $(html2).appendTo($('body')).collector();
      this.after(function() {
        widget2.collector('destroy');
        return widget2.remove();
      });
      return expect(widget2.collector('menu').find('li a.collector-remove')).not.toExist();
    });
  });

  describe("Collector (Searching)", function() {
    beforeEach(function() {
      this.choices = [
        {
          value: 1,
          label: 'first'
        }, {
          value: 2,
          label: 'second'
        }, {
          value: 3,
          label: 'third'
        }, {
          value: 4,
          label: 'fourth'
        }, {
          value: 5,
          label: 'fifth'
        }
      ];
      return this.widget = $('<div id="dummy">&nbsp;</div>').appendTo($('body')).collector({
        options: this.choices
      });
    });
    afterEach(function() {});
    it("should add a search field to the widget", function() {
      return expect(this.widget.collector('searcher')).toExist();
    });
    it("should add the searcher to the container", function() {
      return expect(this.widget.collector('container')).toContain('input.collector-search');
    });
    it("should trigger a search event with the search value when the content of the search changes", function() {
      var callback_value;
      callback_value = null;
      this.widget.bind('collectorsearch', function(event, value) {
        return callback_value = value;
      });
      this.after(function() {
        return this.widget.unbind('collectorsearch');
      });
      this.widget.collector('searcher').val('testSearch');
      this.widget.collector('searcher').change();
      return expect(callback_value).toEqual('testSearch');
    });
    it("should add the collector-filtered class to the widget container when searching for a value", function() {
      expect(this.widget.collector('container')).not.toHaveClass('collector-filtered');
      this.widget.collector('searcher').change();
      return expect(this.widget.collector('container')).toHaveClass('collector-filtered');
    });
    it("should provide a manual search method", function() {
      expect(this.widget.collector('container')).not.toHaveClass('collector-filtered');
      this.widget.collector('search', 'something');
      return expect(this.widget.collector('container')).toHaveClass('collector-filtered');
    });
    it("should provide an unfilter method", function() {
      this.widget.collector('search', 'filter_text');
      expect(this.widget.collector('container')).toHaveClass('collector-filtered');
      this.widget.collector('unfilter');
      return expect(this.widget.collector('container')).not.toHaveClass('collector-filtered');
    });
    it("should add a collector-filtered class to menu options who's label that don't match the search value", function() {
      expect(this.widget.collector('menu').find('li:eq(0)')).not.toHaveClass('collector-filtered');
      expect(this.widget.collector('menu').find('li:eq(1)')).not.toHaveClass('collector-filtered');
      expect(this.widget.collector('menu').find('li:eq(2)')).not.toHaveClass('collector-filtered');
      expect(this.widget.collector('menu').find('li:eq(3)')).not.toHaveClass('collector-filtered');
      expect(this.widget.collector('menu').find('li:eq(4)')).not.toHaveClass('collector-filtered');
      this.widget.collector('search', 'th');
      expect(this.widget.collector('menu').find('li:eq(0)')).toHaveClass('collector-filtered');
      expect(this.widget.collector('menu').find('li:eq(1)')).toHaveClass('collector-filtered');
      expect(this.widget.collector('menu').find('li:eq(2)')).not.toHaveClass('collector-filtered');
      expect(this.widget.collector('menu').find('li:eq(3)')).not.toHaveClass('collector-filtered');
      return expect(this.widget.collector('menu').find('li:eq(4)')).not.toHaveClass('collector-filtered');
    });
    return it("should not render the search field by default", function() {
      var widget2;
      widget2 = $('<div id="dummy">&nbsp</div>').appendTo($('body')).collector({
        options: [
          {
            value: 1,
            label: 'one'
          }, {
            value: 2,
            label: 'two'
          }
        ]
      });
      return expect(widget2.collector('searcher')).not.toExist();
    });
  });

}).call(this);
