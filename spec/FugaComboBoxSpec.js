describe("Fuga ComboBox Widget", function(){

  var self = this;
  self.options = [{label: 'First option', value: 1}, {label: '2nd option', value: 2}, {label: 'Third option', value: 3}];


  // constructor / destructor
  beforeEach(function(){
    // add a text field an turn it into a combobox
    this.widget = jQuery('<input type="text" id="combo" />').appendTo(jQuery('body')).combobox({
      source: self.options
    });

    // the added toggle button, right after the text input
    this.toggler = this.widget.next();
  });

  afterEach(function(){
    this.toggler = null;
  
    // de-initialize the combobox widget and remove the added text field
    this.widget.removebox('destroy').remove();
  });


  // tests
  it("should add toggle button after the text input", function(){
    expect( this.toggler.is("button.ui-button:visible") ).toBeTruthy();
  });

  it("should remove the toggle button at destroy", function(){
    expect( this.widget.combobox('destroy').next("button.ui-button") ).not.toExist();
  });

  it("should set the minLength to zero by default to allow empty searches", function(){
    // do a search with an empty string
    this.widget.combobox('search', '');

    // all available options should be shown
    expect( this.widget.combobox('widget').find('li.ui-menu-item:visible').length ).toEqual( self.options.length );
  });

  it("should still allow the caller to specify a different minLength", function(){
    // add a text field an turn it into a combobox
    var widget2 = jQuery('<input type="text" id="combo2" />').appendTo(jQuery('body')).combobox({
      source: self.options,
      minLength: 2
    });

    // make sure our second widget gets removed after this spec
    this.after(function(){widget2.combobox('destroy').remove();});

    // searching with an empty string shouldn't show options
    expect( widget2.combobox('search', '').combobox('widget') ).not.toBeVisible();
    // searching with a one-character string shouldn't show options
    expect( widget2.combobox('search', 'i').combobox('widget') ).not.toBeVisible();
    // searching with a two-character string SHOULD show options
    expect( widget2.combobox('search', 'ir').combobox('widget') ).toBeVisible();
  });

  it("should disregard the minLength options and always show options when the user clicks the toggler", function(){
    // add a text field an turn it into a combobox
    var widget2 = jQuery('<input type="text" id="combo2" />').appendTo(jQuery('body')).combobox({
      source: self.options,
      // specify a non-zero minLength
      minLength: 3
    });

    // make sure our second widget gets removed after this spec
    this.after(function(){widget2.combobox('destroy').remove();});

    // click the toggler while the text input is empty
    widget2.next().click();

    // options should be shown
    expect( widget2.combobox('widget') ).toBeVisible();
  });

  it("should show the options menu when the toggle button is clicked", function(){
    // user clicks the button
    this.toggler.click();
    // the widget menu should be visible
    expect( this.widget.combobox('widget') ).toBeVisible();
  });

  it("should hide the options menu when the toggle button is clicked while the menu was open", function(){
    // open the options menu by doing an empty search (showing all options)
    this.widget.combobox('search', '');

    // the widget menu should now be visible
    expect( this.widget.combobox('widget') ).toBeVisible();

    // user clicks the toggle button
    this.toggler.click();

    // the widget menu should not be visible anymore
    expect( this.widget.combobox('widget') ).not.toBeVisible();
  });

  it("should move the focus to the text input after clicking the toggler", function(){
    // register a callback that sets focus to true when our text input get focus
    this.widget.bind('focus', function(){ focus_on_text_input = true; });

    // false until text niput receives focus
    var focus_on_text_input = false;

    // user clicks the button
    this.toggler.click();
    
    // check if focus was trasferred to the text input
    expect( focus_on_text_input ).toBeTruthy();
  });

  it("should disregard the content of the text input and show ALL options when clicking the toggle button", function(){
    // fill the text input with a value tht matches with none of the options
    this.widget.val('XXX');

    // click the toggler, opening the options meny
    this.toggler.click();

    // all available options should be shown
    expect( this.widget.combobox('widget').find('li.ui-menu-item:visible').length ).toEqual( self.options.length );
  });
});