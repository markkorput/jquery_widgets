// fuga.combobox inherits from a slightly patched version of the official jQuery UI Autocomplete widget (fuga.autocomplete)
(function($){
  $.fuga.autocomplete.subclass('fuga.combobox', {
    options: {minLength: 0},

    _create: function(){
      var self = this;

      // create the toggler button right after the autocomplete text input
      var toggler = this.toggler = $( "<button type='button'>&nbsp;</button>" )
        .attr( "tabIndex", -1 )
        .attr( "title", "Show All Items" )
        .insertAfter( this.element )
        .button({
          icons: {
            primary: "ui-icon-triangle-1-s"
          },
          text: false
        })
        .removeClass( "ui-corner-all" )
        .addClass( "ui-corner-right ui-button-icon" )
        .click(function() {
          // if options box already visible; hide it
          if(self.widget().is(':visible')){
            self.close();
            return;
          }

          // necessary?
          $(this).blur();

          // perform empty search
          // self.search(self.element.val());
          self.search('');
          self.element.focus();
        });

    }, // end of create function
    
    destroy: function(){
      this.toggler.remove();
    }
  }); // end of ui.ComboAutocomplete widget definition
  
})(jQuery); // end of anonymous wrapper function