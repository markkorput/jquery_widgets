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
      this.widget.collector('menu').find('li:eq(1)').click();
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
      this.widget.collector('menu').find('li:eq(1)').click();
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
      return expect($.map(widget.collector('menu').find('li'), function(a) {
        return $(a).text();
      })).toEqual(['no 1', 'no 2', 'no 3']);
    });
  });

  describe("Collector (Creator)", function() {
    beforeEach(function() {
      return this.widget = $('<div id="dummy">&nbsp;</div>').appendTo($('body')).collector({
        options: ['first', 'second', 'third', 'fourth', 'fifth'],
        allow_create: true
      });
    });
    afterEach(function() {
      this.widget.collector('destroy');
      return this.widget.remove();
    });
    it("should add creator option", function() {
      return expect(this.widget.collector('creator')).toHaveClass('.cllctr-creator');
    });
    it("should add the cllctr-perfect-match class to the container when a search value has a perfect match", function() {
      this.widget.collector('search', 'second');
      return expect(this.widget.collector('container')).toHaveClasse('cllctr-perfect-match');
    });
    it("should add a new option when the creator option is clicked", function() {
      this.widget.collector('search', '6th');
      this.widget.collector('creator').click();
      return expect(this.widget.collector('menu').find('li[data-cllctr-value=new1]').text()).toEqual('6th');
    });
    return it("should trigger a create event", function() {
      var callback_value;
      callback_value = null;
      this.widget.bind('collectorcreate', function(event, value) {
        var callabck_value;
        return callabck_value = value;
      });
      this.after(function() {
        return this.widget.unbind('collectorcreate');
      });
      this.widget.collector('search', 'Number Six');
      return expect(callback_value).toEqual('Number Six');
    });
  });

}).call(this);
