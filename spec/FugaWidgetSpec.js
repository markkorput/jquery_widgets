describe("Fuga Widget", function(){

  beforeEach(function(){
    this.html = '<input type="text" />';
    this.widget = jQuery(this.html).appendTo(jQuery('body')).fugawidget();
  });

  afterEach(function(){
    this.widget.fugawidget('destroy');
    this.widget.remove();
  });

  it("should have a value getter", function(){
    expect(this.widget.fugawidget('value')).toEqual('');
  });

  it("should always give an up-to-date value through the value get method", function(){
    expect(this.widget.fugawidget('value')).toEqual('');
    this.widget.val('test_value');
    expect(this.widget.fugawidget('value')).toEqual('test_value');
  });

  it("should allow us to set a new value through the value setter method", function(){
    this.widget.fugawidget('value', 'new_value');
    expect(this.widget.val()).toEqual('new_value');
    expect(this.widget.fugawidget('value')).toEqual('new_value');
  });

  it("should trigger a widget-style change event itself", function(){
    spyOnEvent(this.widget, 'fugawidgetchange');
    this.widget.val('ok');
    this.widget.change();
    expect('fugawidgetchange').toHaveBeenTriggeredOn(this.widget);
  });
});