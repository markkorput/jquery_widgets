describe("Collecter (Base)", function(){

  beforeEach(function(){
    this.html = '<select><option value="1">first</option><option value="2">second</option></select';
    this.widget = jQuery(this.html).appendTo(jQuery('body')).collecter();
  });

  afterEach(function(){
    this.widget.collecter('destroy');
    this.widget.remove();
  });

  it("should generate an options list", function(){
    expect(this.widget.collecter('menu').find('li').length).toEqual(2);
  });

  it("should provide a value getter", function(){
    expect(this.widget.collecter('value')).toEqual('1');
  });

  it("should change value when an option is clicked", function(){
    this.widget.collecter('menu').find('li a')[1].click();
    expect(this.widget.collecter('value')).toEqual('2');
  });

  it("should allow changing value through the value setter, but only available values are allowed", function(){
    this.widget.collecter('value', '1');
    expect(this.widget.collecter('value')).toEqual('1');
    // options "third" doesn't exist
    this.widget.collecter('value', '1');
    expect(this.widget.collecter('value')).toEqual('1');
  });

  it("should trigger change event when value changes through value setter", function(){
    spyOnEvent(this.widget, 'collecterchange');
    this.widget.collecter('value', 'second');
    expect('collecterchange').toHaveBeenTriggeredOn(this.widget);
  });

  it("should trigger change event when an options is clicked changes through value setter", function(){
    spyOnEvent(this.widget, 'collecterchange');
    this.widget.collecter('menu').find('li a')[1].click();
    expect('collecterchange').toHaveBeenTriggeredOn(this.widget);
  });

  it("should hide the original dom-element", function(){
    expect(this.widget).not.toBeVisible();
  });

  it("should remove the option list on cleanup", function(){
    this.widget.collecter('destroy');
    expect(this.widget.collecter('menu')).not.toExist();
    expect(this.widget).toBeVisible();
  });

  it("should provide an option to specify the available choices", function(){
    widget = jQuery('<div />').appendTo(jQuery('body')).collecter({options: [{value: 1, label: 'no 1'}, {value: 2, label: 'no 2'}, {value: 3, label: 'no 3'}]});
    this.after(function(){
      widget.collecter('destroy');
      widget.remove();
    });

    expect(jQuery.map(widget.collecter('menu').find('li a'), function(a){ return jQuery(a).text(); })).toEqual(['no 1', 'no 2', 'no 3']);
  });
});


describe("Collecter (Display)", function(){

  beforeEach(function(){
    this.html = '<select><option value="1">first</option><option value="2">second</option></select';
    this.widget = jQuery(this.html).appendTo(jQuery('body')).collecter();
  });

  afterEach(function(){
    this.widget.collecter('destroy');
    this.widget.remove();
  });

  it("should render a value displayer", function(){
    expect(this.widget.collecter('display')).toBeVisible();
  });

  it("should remove the value displayer at destroy", function(){
    this.widget.collecter('destroy');
    expect(this.widget.collecter('display')).not.toExist();
  });

  it("should update the display when the value changes", function(){
    this.widget.collecter('value', '2');
    expect(this.widget.collecter('display').text()).toEqual('second');
    this.widget.collecter('menu').find('li:first a').click();
    expect(this.widget.collecter('display').text()).toEqual('first');
  });


  
});