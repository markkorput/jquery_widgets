describe("Fuga RemoveBox Widget", function(){

  beforeEach(function(){
    this.widget = jQuery('<input type="text" id="completer" />').appendTo(jQuery('body')).removebox({
      source: [{label: 'First option', value: 1}, {label: '2nd option', value: 2}, {label: 'Third option', value: 3}]
    });
  });

  afterEach(function(){
    this.widget.removebox('destroy');
    this.widget.remove();
  });

  it("Should and a second link to each menu item", function(){
    // necessary to generate the li items
    this.widget.removebox('search', '');

    this.widget.removebox('widget').find('li').each(function(index, li){
      expect(jQuery(li).find('a').length).toEqual(2);
    });
  });

});