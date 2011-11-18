// CautiousInput
(function($){

  jQuery.widget('ui.cautiousInput', {
    // default options
    options: {delay: 400},

    // set-up the widget by declaring the bindings
    _create: function(){
      // need this because of scope issues
      $this = this;

      // some stuff needs to happen when the user types in the text field
      this.element.bind('keydown', function(event){
        // if the input class is in ready state; trigger start typing event
        // and start monitoring until the user stops typing
        if($this._ready()){
          $this._trigger('startTyping');

          // keep track of the time(-stamp) of the last input; this needs to happen
          // AFTER the _ready check, and BEFORE de _checkStillTyping loop
          $this._lastInputTime = event.timeStamp;

          // check if the user is still typing; this function will keep calling
          // itself with intervals, until the user stopped typing long enough
          $this._checkStillTyping();
        } else {
          // keep track of the time(-stamp) of the last input
          $this._lastInputTime = event.timeStamp;
        }
      });
    }, // end of _create function

    _destroy: function(){ this.element.unbind('keydown'); },

    _timeTillReady: function(){
      return jQuery.isEmptyObject(this._lastInputTime) ? 0 : this._lastInputTime + this.options.delay - (new Date).getTime();
    },// end of _timeTillReady function
    // ready checks if enough time passed since previous input
    // using this.options.delay indicates how much time is 'enough'

    _ready: function(){
      // when no previous timestamp found; means we're in ready state, otherwise check if enough time has passed since last input
      return jQuery.isEmptyObject(this._lastInputTime) || this._timeTillReady() <= 0;
    }, // end of _ready function

    _checkStillTyping: function(){
      if(this._ready()){
        // ready? trigger stopTyping event
        this._trigger('stopTyping');

        // only trigger newValue event when the previous stopTyping event was on a different value
        if(this.element.val() == ''){
          this._trigger('emptyValue');
          // special "nevermind" callback indicating typing didn't turn out to be useful
          this._trigger('nevermind');
        } else if(this.element.val() != this._previousValue){
          this._trigger('newValue', 0, this.element.val());
        // otherwise trigger sameValue event
        }else{
          this._trigger('sameValue', 0, this.element.val());
          // special "nevermind" callback indicating typing didn't turn out to be useful
          this._trigger('nevermind', 0, this.element.val());
        }

        // save previous value for next time
        this._previousValue = this.element.val();
      } else {
        // check again in _timeTillReady minus 5ms
        // this complicated syntax is needed to let this function call itself and maintain a usefull reference in `this`
        window.setTimeout(function(self){ return function(){self._checkStillTyping();}}(this), this._timeTillReady()-5);
      }
    } // end of _checkStillTyping function

  }); // end of 'ui.cautiousInput' widget definition
})(jQuery);

// fuga.autocomplete a slightly patched version of the official jQuery autocomplete widget
(function($){
  // make an inheritable version of the official jquery autocomplete
  // jQuery.ui.basewidget.subclass('ui.masterAutocomplete', $.ui.autocomplete.prototype);
  // our patched version of jQuery's autocomplete
  $.ui.basewidget.subclass('fuga.autocomplete', {
    options: {
      appendTo: "body",
      autoFocus: false,
      delay: 300,
      minLength: 1,
      position: {
        my: "left top",
        at: "left bottom",
        collision: "none"
      },
      source: null,
      formatItem: function(item){return item.label},
    },

    pending: 0,

    _create: function() {
      var self = this,
        doc = this.element[ 0 ].ownerDocument,
        suppressKeyPress;

      this.element
        .addClass( "ui-autocomplete-input" )
        .attr( "autocomplete", "off" )
        // TODO verify these actually work as intended
        .attr({
          role: "textbox",
          "aria-autocomplete": "list",
          "aria-haspopup": "true"
        })
        .bind( "keydown.autocomplete", function( event ) {
          if ( self.options.disabled || self.element.propAttr( "readOnly" ) ) {
            return;
          }

          suppressKeyPress = false;
          var keyCode = $.ui.keyCode;
          switch( event.keyCode ) {
          case keyCode.PAGE_UP:
            self._move( "previousPage", event );
            break;
          case keyCode.PAGE_DOWN:
            self._move( "nextPage", event );
            break;
          case keyCode.UP:
            self._move( "previous", event );
            // prevent moving cursor to beginning of text field in some browsers
            event.preventDefault();
            break;
          case keyCode.DOWN:
            self._move( "next", event );
            // prevent moving cursor to end of text field in some browsers
            event.preventDefault();
            break;
          case keyCode.ENTER:
          case keyCode.NUMPAD_ENTER:
            // when menu is open and has focus
            if ( self.menu.active ) {
              // #6055 - Opera still allows the keypress to occur
              // which causes forms to submit
              suppressKeyPress = true;
              event.preventDefault();
            }
            //passthrough - ENTER and TAB both select the current element
          case keyCode.TAB:
            if ( !self.menu.active ) {
              return;
            }
            self.menu.select( event );
            break;
          case keyCode.ESCAPE:
            self.element.val( self.term );
            self.close( event );
            break;
          default:
            // keypress is triggered before the input value is changed
            clearTimeout( self.searching );
            self.searching = setTimeout(function() {
              // only search if the value has changed
              if ( self.term != self.element.val() ) {
                self.selectedItem = null;
                self.search( null, event );
              }
            }, self.options.delay );
            break;
          }
        })
        .bind( "keypress.autocomplete", function( event ) {
          if ( suppressKeyPress ) {
            suppressKeyPress = false;
            event.preventDefault();
          }
        })
        .bind( "focus.autocomplete", function() {
          if ( self.options.disabled ) {
            return;
          }

          self.selectedItem = null;
          self.previous = self.element.val();
        })
        .bind( "blur.autocomplete", function( event ) {
          if ( self.options.disabled ) {
            return;
          }

          clearTimeout( self.searching );
          // clicks on the menu (or a button to trigger a search) will cause a blur event
          self.closing = setTimeout(function() {
            self.close( event );
            self._change( event );
          }, 150 );
        });
      this._initSource();
      this.response = function() {
        return self._response.apply( self, arguments );
      };
      this.menu = $( "<ul></ul>" )
        .addClass( "ui-autocomplete" )
        .appendTo( $( this.options.appendTo || "body", doc )[0] )
        // prevent the close-on-blur in case of a "slow" click on the menu (long mousedown)
        .mousedown(function( event ) {
          // clicking on the scrollbar causes focus to shift to the body
          // but we can't detect a mouseup or a click immediately afterward
          // so we have to track the next mousedown and close the menu if
          // the user clicks somewhere outside of the autocomplete
          var menuElement = self.menu.element[ 0 ];
          if ( !$( event.target ).closest( ".ui-menu-item" ).length ) {
            setTimeout(function() {
              $( document ).one( 'mousedown', function( event ) {
                if ( event.target !== self.element[ 0 ] &&
                  event.target !== menuElement &&
                  !$.ui.contains( menuElement, event.target ) ) {
                  self.close();
                }
              });
            }, 1 );
          }

          // use another timeout to make sure the blur-event-handler on the input was already triggered
          setTimeout(function() {
            clearTimeout( self.closing );
          }, 13);
        })
        .menu({
          focus: function( event, ui ) {
            var item = ui.item.data( "item.autocomplete" );
            if ( false !== self._trigger( "focus", event, { item: item } ) ) {
              // use value to match what will end up in the input, if it was a key event
              if ( /^key/.test(event.originalEvent.type) ) {
                self.element.val( self.options.formatItem(item) );
              }
            }
          },
          selected: function(event, ui){
            self._handleMenuSelectedEvent(event, ui)
          },
          // selected: function( event, ui ) {
          //             console.log('menu item select:');
          //             console.log(arguments);
          // 
          //             var item = ui.item.data( "item.autocomplete" ),
          //               previous = self.previous;
          // 
          //             // only trigger when focus was lost (click on menu)
          //             if ( self.element[0] !== doc.activeElement ) {
          //               self.element.focus();
          //               self.previous = previous;
          //               // #6109 - IE triggers two focus events and the second
          //               // is asynchronous, so we need to reset the previous
          //               // term synchronously and asynchronously :-(
          //               setTimeout(function() {
          //                 self.previous = previous;
          //                 self.selectedItem = item;
          //               }, 1);
          //             }
          // 
          //             if ( false !== self._trigger( "select", event, { item: item } ) ) {
          //               self.element.val( item.value );
          //             }
          //             // reset the term after the select event
          //             // this allows custom select handling to work properly
          //             self.term = self.element.val();
          // 
          //             self.close( event );
          //             self.selectedItem = item;
          //           },
          blur: function( event, ui ) {
            // don't set the value of the text field if it's already correct
            // this prevents moving the cursor unnecessarily
            if ( self.menu.element.is(":visible") &&
              ( self.element.val() !== self.term ) ) {
              self.element.val( self.term );
            }
          }
        })
        .zIndex( this.element.zIndex() + 1 )
        // workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
        .css({ top: 0, left: 0 })
        .hide()
        .data( "menu" );
      if ( $.fn.bgiframe ) {
         this.menu.element.bgiframe();
      }
    },

    val: function(new_value){
      if(new_value === undefined) return this.value;
      this.value = new_value;
      
      // check if the newly set value matches with one of the source item values. If so, set the label of that option in the text field.
      var normalizer = this._normalizeItem;
      if($.isArray(this.options.source) && (
        ( matching_options = $.grep(this.options.source, function(item){return normalizer(item).value == new_value})).length
      ))
        this.element.val(normalizer(matching_options[0]).label);
    },

    destroy: function() {
      this.element
        .removeClass( "ui-autocomplete-input" )
        .removeAttr( "autocomplete" )
        .removeAttr( "role" )
        .removeAttr( "aria-autocomplete" )
        .removeAttr( "aria-haspopup" );
      this.menu.element.remove();
      $.Widget.prototype.destroy.call( this );
    },

    _setOption: function( key, value ) {
      $.Widget.prototype._setOption.apply( this, arguments );
      if ( key === "source" ) {
        this._initSource();

        // if the suggestions box was opened when the options were changed, refresh it by running a new search
        if ( this.menu.element.is(":visible") )
          this.search(this.element.val());
      }
      if ( key === "appendTo" ) {
        this.menu.element.appendTo( $( value || "body", this.element[0].ownerDocument )[0] )
      }
      if ( key === "disabled" && value && this.xhr ) {
        this.xhr.abort();
      }
    },

    _initSource: function() {
      var self = this,
        array,
        url;
      if ( $.isArray(this.options.source) ) {
        array = this.options.source;
        this.source = function( request, response ) {
          response( $.ui.autocomplete.filter(array, request.term) );
        };
      } else if ( typeof this.options.source === "string" ) {
        url = this.options.source;
        this.source = function( request, response ) {
          if ( self.xhr ) {
            self.xhr.abort();
          }
          self.xhr = $.ajax({
            url: url,
            data: request,
            dataType: "json",
            autocompleteRequest: ++requestIndex,
            success: function( data, status ) {
              if ( this.autocompleteRequest === requestIndex ) {
                response( data );
              }
            },
            error: function() {
              if ( this.autocompleteRequest === requestIndex ) {
                response( [] );
              }
            }
          });
        };
      } else {
        this.source = this.options.source;
      }
    },

    search: function( value, event ) {
      value = value != null ? value : this.element.val();

      // always save the actual value, not the one passed as an argument
      this.term = this.element.val();

      if ( value.length < this.options.minLength ) {
        return this.close( event );
      }

      clearTimeout( this.closing );
      if ( this._trigger( "search", event ) === false ) {
        return;
      }

      return this._search( value );
    },

    _search: function( value ) {
      this.pending++;
      this.element.addClass( "ui-autocomplete-loading" );

      this.source( { term: value }, this.response );
    },

    _response: function( content ) {
      if ( !this.options.disabled && content && content.length ) {
        content = this._normalize( content );
        this._suggest( content );
        this._trigger( "open" );
      } else {
        this.close();
      }
      this.pending--;
      if ( !this.pending ) {
        this.element.removeClass( "ui-autocomplete-loading" );
      }
    },

    close: function( event ) {
      clearTimeout( this.closing );
      if ( this.menu.element.is(":visible") ) {
        this.menu.element.hide();
        this.menu.deactivate();
        this._trigger( "close", event );
      }
    },

    _handleMenuSelectedEvent: function( event, ui ) {
      var item = ui.item.data( "item.autocomplete" ),
        previous = this.previous;

      // only trigger when focus was lost (click on menu)
      if ( this.element[0] !== this.element[ 0 ].ownerDocument.activeElement ) {
        this.element.focus();
        this.previous = previous;
        // #6109 - IE triggers two focus events and the second
        // is asynchronous, so we need to reset the previous
        // term synchronously and asynchronously :-(
        setTimeout(function() {
          this.previous = previous;
          this.selectedItem = item;
        }, 1);
      }

      if ( false !== this._trigger( "select", event, { item: item } ) ){
        this.element.val( this.options.formatItem(item) );
        this.value = item.value;
      }

      // reset the term after the select event
      // this allows custom select handling to work properly
      this.term = this.element.val();

      this.close( event );
      this.selectedItem = item;
    },

    _change: function( event ) {
      if ( this.previous !== this.element.val() ) {
        this._trigger( "change", event, { item: this.selectedItem } );
      }
    },

    _normalize: function( items ) {
      var normalizer = this._normalizeItem;
      return $.map(items, function(item){return normalizer(item);});
    },

    _normalizeItem: function(item){
      // good as it is
      if(item.label && item.value) return item;
      // when a string; both valur and label are the same
      if(typeof item == "string") return {label: item, value: item};
      // default; add a label and value attribute to the item object
      return $.extend({
        label: item.label || item.value,
        value: item.value || item.label
      });
    },
    
    _suggest: function( items ) {
      var ul = this.menu.element
        .empty()
        .zIndex( this.element.zIndex() + 1 );
      this._renderMenu( ul, items );
      // TODO refresh should check if the active item is still in the dom, removing the need for a manual deactivate
      this.menu.deactivate();
      this.menu.refresh();

      // size and position menu
      ul.show();
      this._resizeMenu();
      ul.position( $.extend({
        of: this.element
      }, this.options.position ));

      if ( this.options.autoFocus ) {
        this.menu.next( new $.Event("mouseover") );
      }
    },

    _resizeMenu: function() {
      var ul = this.menu.element;
      ul.outerWidth( Math.max(
        ul.width( "" ).outerWidth(),
        this.element.outerWidth()
      ) );
    },

    _renderMenu: function( ul, items ) {
      var self = this;
      $.each( items, function( index, item ) {
        self._renderItem(item).appendTo(ul);
      });
    },

    _renderItem: function(item) {
      return $( "<li></li>" )
        .data( "item.autocomplete", item )
        .append( $( "<a></a>" ).text( this.options.formatItem(item) ) );
    },

    _move: function( direction, event ) {
      if ( !this.menu.element.is(":visible") ) {
        this.search( null, event );
        return;
      }
      if ( this.menu.first() && /^previous/.test(direction) ||
          this.menu.last() && /^next/.test(direction) ) {
        this.element.val( this.term );
        this.menu.deactivate();
        return;
      }
      this.menu[ direction ]( event );
    },

    widget: function() {
      return this.menu.element;
    }
  });

  $.extend( $.ui.autocomplete, {
    escapeRegex: function( value ) {
      return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    filter: function(array, term) {
      var matcher = new RegExp( $.ui.autocomplete.escapeRegex(term), "i" );
      return $.grep( array, function(value) {
        return matcher.test( value.label || value.value || value );
      });
    }
  });
})(jQuery);

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

    } // end of create function
  }); // end of ui.ComboAutocomplete widget definition
  
})(jQuery); // end of anonymous wrapper function

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
      if(!$(event.originalTarget).hasClass(this.options.removerClass)){
        // continue with the original handler
        return this._super(event, ui);
      }
      
      // the rmeove link was clicked, trigger remove callback and remove option is our source was an array 
      removed_item = ui.item.data( "item.autocomplete" );

      // trigger remove callback and unless this callback cancels workflow, remove the option internally
      if($.isArray(this.options.source) && false !== this._trigger('remove', event, removed_item)){
        var normalizer = this._normalizeItem;
        // remove the item from the source array (if it was an array)
        console.log(removed_item.value);
        this.option('source', $.grep(this.options.source, function(item){return normalizer(item).value != removed_item.value}));
      }
    }
  });

})(jQuery);
