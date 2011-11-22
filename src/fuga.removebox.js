// fuga.deletebox, inheriting from fuga.combobox
(function($){

  $.fuga.combobox.subclass('fuga.removebox', {
    // extra parameter options; the text (or html) that will be
    // rendered inside the remover links and the class appended to it
    options: {removerText: 'delete', removerClass: 'removeOption'},

    // overwrite fuga.autocomplete's _renderItem attribute;
    // call the original one but add an extra remove link to it
    _renderItem: function(item){
      return this._super(item).append( $( '<a></a>' ).text( this.options.removerText ).addClass( this.options.removerClass ) );
    },

    _handleMenuSelectedEvent: function( event, ui ) {
      // check if it was NOT the remover link that was clicked
      if(!$(event.originalTarget).hasClass(this.options.removerClass))
        // continue with the original handler
        return this._super(event, ui);
      else
        return _handleItemRemove( event, ui);
    },

    _handleItemRemove: function( event, ui ){
      // the remove link was clicked, trigger remove callback and remove option is our source was an array 
      removed_item = ui.item.data( "item.autocomplete" );

      // trigger remove callback and unless this callback cancels workflow, remove the option internally
      if($.isArray(this.options.source) && false !== this._trigger('remove', event, removed_item)){
        var normalizer = this._normalizeItem;
        // remove the item from the source array (if it was an array)
        this.option('source', $.grep(this.options.source, function(item){return normalizer(item).value != removed_item.value}));
      }

      // clear current value (hidden value as well as visible shown value) if the removed item was the selected item
      if(this.value == removed_item.value){
        this.value = null;
        this.element.val('');
      }
    }
  });

})(jQuery);
