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
      this.widget.collector('menu').find('li a')[1].click();
      return expect(this.widget.collector('value')).toEqual('2');
    });
    it("should allow changing value through the value setter, but only available values are allowed", function() {
      this.widget.collector('value', '1');
      expect(this.widget.collector('value')).toEqual('1');
      this.widget.collector('value', '1');
      return expect(this.widget.collector('value')).toEqual('1');
    });
    it("should trigger change event when value changes through value setter", function() {
      spyOnEvent(this.widget, 'collectorchange');
      this.widget.collector('value', 'second');
      return expect('collectorchange').toHaveBeenTriggeredOn(this.widget);
    });
    it("should trigger change event when an options is clicked changes through value setter", function() {
      spyOnEvent(this.widget, 'collectorchange');
      this.widget.collector('menu').find('li a')[1].click();
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
      return expect($.map(widget.collector('menu').find('li a'), function(a) {
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
      this.widget.collector('menu').find('li:first a').click();
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
      return expect(this.widget.collector('container')).toBeVisible();
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
    return it("should trigger a close event when the menu closes by a click", function() {
      spyOnEvent(this.widget, 'collectorclose');
      this.widget.collector('display').click();
      this.widget.collector('display').click();
      return expect('collectorclose').toHaveBeenTriggeredOn(this.widget);
    });
  });

}).call(this);
